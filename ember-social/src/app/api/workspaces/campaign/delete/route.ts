import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
    const supabase = createAdminClient()

    try {
        const { batchId } = await req.json()
        if (!batchId) {
            return NextResponse.json({ error: 'batchId is required' }, { status: 400 })
        }

        // Delete the batch's posts so they no longer appear in approvals.
        // Clean up child rows first to avoid FK violations, then the posts.
        const { data: postRows } = await supabase
            .from('posts')
            .select('id')
            .eq('campaign_batch_id', batchId)
        const postIds = (postRows || []).map((p: any) => p.id)

        if (postIds.length > 0) {
            await supabase.from('post_feedback').delete().in('post_id', postIds)
            await supabase.from('post_results').delete().in('post_id', postIds)
        }

        const { error: postsError } = await supabase.from('posts').delete().eq('campaign_batch_id', batchId)
        if (postsError) throw postsError

        const { error } = await supabase.from('campaign_batches').delete().eq('id', batchId)
        if (error) throw error

        return NextResponse.json({ ok: true, deletedPosts: postIds.length })
    } catch (error: any) {
        console.error('campaign delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
