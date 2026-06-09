import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const { searchParams } = new URL(req.url)
        const workspaceParam = searchParams.get('workspaceId')
        const statuses = searchParams.get('statuses') // comma-separated

        if (!workspaceParam) {
            return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
        }

        const workspaceId = await resolveWorkspaceId(workspaceParam)

        const statusList = statuses
            ? statuses.split(',').map(s => s.trim())
            : ['pending_approval', 'draft', 'approved']

        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, content, media_urls, platforms, scheduled_at, status, approval_token, created_at, client_status, campaign_batch_id, variants, pillar, rationale, psychology_note, style, vehicle_ids, tagline, tagline_accent, image_prompt, image_status, vehicle_id')
            .eq('workspace_id', workspaceId)
            .in('status', statusList)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Fetch batch tokens and feedback counts for all posts
        const batchIds = [...new Set((posts || []).map(p => (p as any).campaign_batch_id).filter(Boolean))] as string[]
        let batchTokens: Record<string, string> = {}
        let feedbackCounts: Record<string, number> = {}

        if (batchIds.length > 0) {
            const { data: batches } = await supabase
                .from('campaign_batches')
                .select('id, public_token')
                .in('id', batchIds)

            for (const b of (batches || [])) {
                batchTokens[b.id] = b.public_token
            }
        }

        const postIds = (posts || []).map(p => p.id)
        if (postIds.length > 0) {
            // Count open feedback per post
            const { data: fbRows } = await supabase
                .from('post_feedback')
                .select('post_id')
                .in('post_id', postIds)
                .eq('status', 'open')

            for (const fb of (fbRows || [])) {
                feedbackCounts[fb.post_id] = (feedbackCounts[fb.post_id] || 0) + 1
            }
        }

        const enrichedPosts = (posts || []).map(p => ({
            ...p,
            batch_token: (p as any).campaign_batch_id ? batchTokens[(p as any).campaign_batch_id] || null : null,
            feedback_count: feedbackCounts[p.id] || 0
        }))

        // Also fetch brand kit
        const { data: brandKit } = await supabase
            .from('brand_kits')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single()

        return NextResponse.json({ posts: enrichedPosts, brandKit: brandKit || null })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
