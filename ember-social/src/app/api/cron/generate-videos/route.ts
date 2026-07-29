import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { submitSeedanceTask, pollSeedanceTask } from '@/lib/video/seedance'
import { appendOutro } from '@/lib/video/appendOutro'
import { uploadCampaignVideo } from '@/lib/media/uploadCampaignVideo'

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

    try {
        // One job per tick — advances whichever job is furthest along, so a
        // batch of 3 completes over several ticks instead of all racing at once.
        // Fetch a small batch and rank client-side by an explicit priority map,
        // since sorting the status string alphabetically doesn't match progress order.
        const STATUS_PRIORITY: Record<string, number> = { compositing: 0, rendering: 1, generating: 1, pending: 2 }
        const { data: jobs, error } = await supabase
            .from('posts')
            .select('id, workspace_id, video_status, video_concept, video_task_id, video_prompt, media_urls')
            .in('video_status', ['pending', 'generating', 'rendering', 'compositing'])
            .order('created_at', { ascending: true })
            .limit(10)

        if (error) throw error
        if (!jobs || jobs.length === 0) return NextResponse.json({ ok: true, processed: 0 })

        const job = (jobs as any[]).reduce((best, current) =>
            STATUS_PRIORITY[current.video_status] < STATUS_PRIORITY[best.video_status] ? current : best
        )

        if (job.video_status === 'pending') {
            // Submit to Seedance. video_prompt and any reference image URLs are
            // expected to already be set by the route that created this job
            // (Task 14) — this step just kicks off the render.
            const refUrls: string[] = job.media_urls || []
            const taskId = await submitSeedanceTask(job.video_prompt, refUrls, '16:9')
            await supabase.from('posts').update({ video_status: 'generating', video_task_id: taskId } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'submitted', postId: job.id })
        }

        if (job.video_status === 'generating' || job.video_status === 'rendering') {
            const result = await pollSeedanceTask(job.video_task_id)
            if (result.state === 'processing') {
                await supabase.from('posts').update({ video_status: 'rendering' } as never).eq('id', job.id)
                return NextResponse.json({ ok: true, processed: 1, action: 'still_rendering', postId: job.id })
            }
            if (result.state === 'fail') {
                await supabase.from('posts').update({ video_status: 'failed', last_error: result.failMsg } as never).eq('id', job.id)
                return NextResponse.json({ ok: true, processed: 1, action: 'failed', postId: job.id, error: result.failMsg })
            }
            // success — download and stash under media_urls temporarily so the
            // compositing step below has the raw render to work from.
            const buf = Buffer.from(await (await fetch(result.videoUrl!)).arrayBuffer())
            const raw = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: `${job.id}-raw`, bytes: buf })
            if (!raw.ok) throw new Error(raw.error)
            await supabase.from('posts').update({ video_status: 'compositing', media_urls: [raw.publicUrl] } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'rendered', postId: job.id })
        }

        if (job.video_status === 'compositing') {
            const rawUrl = (job.media_urls || [])[0]
            if (!rawUrl) throw new Error('compositing job has no raw video URL')
            const rawBuf = Buffer.from(await (await fetch(rawUrl)).arrayBuffer())
            const finalBuf = await appendOutro(rawBuf, 'BUILT FOR THE ROAD AHEAD.', 'ROAD')
            const up = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: job.id, bytes: finalBuf })
            if (!up.ok) throw new Error(up.error)
            await supabase.from('posts').update({ video_status: 'ready', media_urls: [up.publicUrl], image_status: 'ready' } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'ready', postId: job.id })
        }

        return NextResponse.json({ ok: true, processed: 0 })
    } catch (error: any) {
        console.error('generate-videos cron error:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
