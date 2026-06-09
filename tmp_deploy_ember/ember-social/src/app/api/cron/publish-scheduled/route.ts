import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { publishPost } from '@/lib/publish'
import { fetchEngagementSnapshot } from '@/lib/engagement/fetchEngagement'

export const maxDuration = 300;

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

    try {
        const supabase = admin()
        const now = new Date()
        const nowIso = now.toISOString()

        // Approved posts whose scheduled time has arrived.
        const { data: approvedPosts, error: approvedErr } = await supabase
            .from('posts')
            .select('id')
            .eq('status', 'approved')
            .not('scheduled_at', 'is', null)
            .lte('scheduled_at', nowIso)
            .order('scheduled_at', { ascending: true })
            .limit(10)

        if (approvedErr) console.error('publish-scheduled: approved query error:', approvedErr)

        // Posts stuck in 'publishing' are recovered: a previous run crashed
        // mid-flight (timeout, deploy interrupt, etc) and left them
        // unrecoverable since the cron only picks 'approved' posts. Without
        // this, one bad run silently swallows the post forever.
        // We use scheduled_at (not created_at) as the staleness signal: cron
        // runs every 5 min with a 5 min max duration, so any still-in-flight
        // publish must have scheduled_at within the last ~10 min. Anything
        // older that's still 'publishing' is definitely stuck.
        const stuckCutoff = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
        const { data: stuckPosts, error: stuckErr } = await supabase
            .from('posts')
            .select('id, scheduled_at')
            .eq('status', 'publishing')
            .not('scheduled_at', 'is', null)
            .lte('scheduled_at', stuckCutoff)
            .limit(5)

        if (stuckErr) console.error('publish-scheduled: stuck query error:', stuckErr)
        if (stuckPosts && stuckPosts.length > 0) {
            console.warn(`publish-scheduled: recovering ${stuckPosts.length} stuck post(s)`)
        }

        const allPosts = [...(approvedPosts ?? []), ...(stuckPosts ?? [])]

        if (allPosts.length === 0) {
            return NextResponse.json({ success: true, published: 0 })
        }

        const results: any[] = []
        for (const post of allPosts as any[]) {
            try {
                const outcome = await publishPost(post.id)
                results.push({ postId: post.id, ...outcome })
            } catch (err: any) {
                // Don't let one bad post crash the whole batch — log it,
                // mark the post failed so it doesn't get stuck, continue.
                const message = err?.message || 'Unknown error'
                console.error(`publish-scheduled: post ${post.id} threw:`, err)
                await supabase
                    .from('posts')
                    .update({ status: 'failed', last_error: message } as never)
                    .eq('id', post.id)
                results.push({ postId: post.id, success: false, error: message })
            }
        }

        // Fetch engagement for previously published posts — best-effort
        let engagementSummary = { updated: 0, errors: 0 }
        try {
            engagementSummary = await fetchEngagementSnapshot(supabase)
        } catch (err: any) {
            console.error('publish-scheduled: engagement fetch error:', err)
        }

        return NextResponse.json({
            success: true,
            published: allPosts.length,
            results,
            engagement: engagementSummary
        })
    } catch (error: any) {
        console.error('publish-scheduled cron error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
