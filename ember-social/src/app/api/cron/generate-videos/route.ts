import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { submitSeedanceTask, pollSeedanceTask } from '@/lib/video/seedance'
import { appendOutro } from '@/lib/video/appendOutro'
import { uploadCampaignVideo } from '@/lib/media/uploadCampaignVideo'

// NOTE: submitSeedanceTask() needs KIE_API_KEY. It has so far only ever lived
// in local .env.local for scripts — make sure it's also added to this
// project's Vercel environment variables, or every tick here will fail.

export const maxDuration = 300

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function authorized(req: Request): boolean {
    // Vercel cron sends user-agent 'vercel-cron/1.0' (lowercase) — match
    // case-insensitively so a casing change upstream doesn't lock the cron out.
    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    if (ua.includes('vercel-cron')) return true
    const secret = process.env.CRON_SECRET
    if (!secret) return process.env.NODE_ENV !== 'production'
    const auth = req.headers.get('authorization') || ''
    return auth === `Bearer ${secret}`
}

export async function GET(req: Request) {
    if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = admin()

    // Well past the 12-minute Seedance poll ceiling plus retry margin — a job
    // still not 'ready' after this long is stuck (stale task id, silently
    // dead render, etc) and must not keep winning the single per-tick slot
    // over every other job forever.
    //
    // This cutoff only applies to jobs that have actually been SUBMITTED to
    // Seedance (generating/rendering/compositing). It is measured against
    // created_at, which is set at plan-generation time — not when the job
    // starts processing. The cron advances exactly one job per 10-minute
    // tick, and a single video takes ~3 ticks (submit → poll/download →
    // composite) end to end. A batch of 3 video jobs is inserted with
    // near-identical created_at and drains strictly sequentially (pending
    // has the lowest priority below), so job 2 can legitimately still be
    // mid-render ~60 minutes after created_at, and job 3 may not even be
    // submitted yet by then. 4 hours comfortably covers worst-case queue
    // drain for a full batch of 3 without punishing normal queue depth.
    const STUCK_CUTOFF_MS = 4 * 60 * 60 * 1000

    try {
        // One job per tick — advances whichever job is furthest along, so a
        // batch of 3 completes over several ticks instead of all racing at once.
        // Fetch a small batch and rank client-side by an explicit priority map,
        // since sorting the status string alphabetically doesn't match progress order.
        const STATUS_PRIORITY: Record<string, number> = { compositing: 0, rendering: 1, generating: 1, pending: 2 }
        const { data: jobs, error } = await supabase
            .from('posts')
            .select('id, workspace_id, video_status, video_concept, video_task_id, video_prompt, media_urls, created_at')
            .in('video_status', ['pending', 'generating', 'rendering', 'compositing'])
            .order('created_at', { ascending: true })
            .limit(10)

        if (error) throw error
        if (!jobs || jobs.length === 0) return NextResponse.json({ ok: true, processed: 0 })

        // Recover jobs that have been stuck for too long instead of letting
        // them starve the queue: flip them to 'failed' and drop them from
        // this tick's candidate pool. 'pending' jobs are exempt — they
        // haven't been submitted to Seedance yet, so they haven't consumed
        // any resource and by definition aren't "stuck," they're just
        // waiting their turn behind other jobs in the queue.
        const now = Date.now()
        const staleJobs = (jobs as any[]).filter(j => j.video_status !== 'pending' && now - new Date(j.created_at).getTime() > STUCK_CUTOFF_MS)
        const activeJobs = (jobs as any[]).filter(j => j.video_status === 'pending' || now - new Date(j.created_at).getTime() <= STUCK_CUTOFF_MS)

        for (const stale of staleJobs) {
            console.warn(`generate-videos: job ${stale.id} stuck in '${stale.video_status}' past ${STUCK_CUTOFF_MS / 60000}min, marking failed`)
            const { error: staleErr } = await supabase
                .from('posts')
                .update({ video_status: 'failed', last_error: `Video generation timed out after ${STUCK_CUTOFF_MS / 60000} minutes` } as never)
                .eq('id', stale.id)
            if (staleErr) console.error(`generate-videos: failed to mark stuck job ${stale.id} as failed:`, staleErr)
        }

        if (activeJobs.length === 0) return NextResponse.json({ ok: true, processed: 0, recovered: staleJobs.length })

        const job = activeJobs.reduce((best, current) =>
            STATUS_PRIORITY[current.video_status] < STATUS_PRIORITY[best.video_status] ? current : best
        )

        try {
            if (job.video_status === 'pending') {
                // Submit to Seedance. video_prompt and any reference image URLs are
                // expected to already be set by the route that created this job
                // (Task 14) — this step just kicks off the render.
                const refUrls: string[] = job.media_urls || []
                const taskId = await submitSeedanceTask(job.video_prompt, refUrls, '16:9')
                const { error: updateErr } = await supabase
                    .from('posts')
                    .update({ video_status: 'generating', video_task_id: taskId } as never)
                    .eq('id', job.id)
                if (updateErr) {
                    // The (billable) Seedance submission already succeeded, but the
                    // DB still shows 'pending' — the next tick will resubmit this
                    // same job to Seedance again unless this is caught and fixed.
                    console.error(`generate-videos: DB update to 'generating' failed for job ${job.id} after Seedance submission (task ${taskId}) — job will be resubmitted next tick:`, updateErr)
                }
                return NextResponse.json({ ok: true, processed: 1, action: 'submitted', postId: job.id })
            }

            if (job.video_status === 'generating' || job.video_status === 'rendering') {
                const result = await pollSeedanceTask(job.video_task_id)
                if (result.state === 'processing') {
                    const { error: updateErr } = await supabase.from('posts').update({ video_status: 'rendering' } as never).eq('id', job.id)
                    if (updateErr) console.error(`generate-videos: failed to update job ${job.id} to 'rendering':`, updateErr)
                    return NextResponse.json({ ok: true, processed: 1, action: 'still_rendering', postId: job.id })
                }
                if (result.state === 'fail') {
                    const { error: updateErr } = await supabase.from('posts').update({ video_status: 'failed', last_error: result.failMsg } as never).eq('id', job.id)
                    if (updateErr) console.error(`generate-videos: failed to mark job ${job.id} as failed:`, updateErr)
                    return NextResponse.json({ ok: true, processed: 1, action: 'failed', postId: job.id, error: result.failMsg })
                }
                // success — download and stash under media_urls temporarily so the
                // compositing step below has the raw render to work from.
                const buf = Buffer.from(await (await fetch(result.videoUrl!)).arrayBuffer())
                const raw = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: `${job.id}-raw`, bytes: buf })
                if (!raw.ok) throw new Error(raw.error)
                const { error: updateErr } = await supabase.from('posts').update({ video_status: 'compositing', media_urls: [raw.publicUrl] } as never).eq('id', job.id)
                if (updateErr) console.error(`generate-videos: failed to update job ${job.id} to 'compositing':`, updateErr)
                return NextResponse.json({ ok: true, processed: 1, action: 'rendered', postId: job.id })
            }

            if (job.video_status === 'compositing') {
                const rawUrl = (job.media_urls || [])[0]
                if (!rawUrl) throw new Error('compositing job has no raw video URL')
                const rawBuf = Buffer.from(await (await fetch(rawUrl)).arrayBuffer())
                const finalBuf = await appendOutro(rawBuf, 'BUILT FOR THE ROAD AHEAD.', 'ROAD')
                const up = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: job.id, bytes: finalBuf })
                if (!up.ok) throw new Error(up.error)
                const { error: updateErr } = await supabase.from('posts').update({ video_status: 'ready', media_urls: [up.publicUrl], image_status: 'ready' } as never).eq('id', job.id)
                if (updateErr) console.error(`generate-videos: failed to update job ${job.id} to 'ready':`, updateErr)

                // Best-effort cleanup of the now-orphaned raw Seedance render — the
                // post's media_urls has moved on to the composited video above, and
                // this file would otherwise sit in campaign-media forever. A cleanup
                // failure must never block the job from reaching 'ready'.
                try {
                    const rawPath = rawUrl.split('/campaign-media/')[1]
                    if (rawPath) {
                        const { error: removeErr } = await supabase.storage.from('campaign-media').remove([rawPath])
                        if (removeErr) console.warn(`generate-videos: failed to delete raw video for job ${job.id}:`, removeErr)
                    }
                } catch (cleanupErr) {
                    console.warn(`generate-videos: raw video cleanup threw for job ${job.id}:`, cleanupErr)
                }

                return NextResponse.json({ ok: true, processed: 1, action: 'ready', postId: job.id })
            }

            return NextResponse.json({ ok: true, processed: 0 })
        } catch (jobError: any) {
            // Don't let one bad job (e.g. pollSeedanceTask throwing on a kie.ai
            // 5xx) crash the whole cron tick — that just gets this same job
            // retried head-of-line next tick with no progress ever made. Mark
            // it failed and return cleanly instead, mirroring the per-post
            // try/catch in publish-scheduled/route.ts.
            const message = jobError?.message || 'Unknown error'
            console.error(`generate-videos: job ${job.id} processing threw:`, jobError)
            const { error: failErr } = await supabase
                .from('posts')
                .update({ video_status: 'failed', last_error: message } as never)
                .eq('id', job.id)
            if (failErr) console.error(`generate-videos: failed to mark job ${job.id} as failed after processing error:`, failErr)
            return NextResponse.json({ ok: true, processed: 1, action: 'error', postId: job.id, error: message })
        }
    } catch (error: any) {
        console.error('generate-videos cron error:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
