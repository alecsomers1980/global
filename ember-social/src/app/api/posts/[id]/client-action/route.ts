import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { token, action } = body || {}

        if (!token || !action || !['approve', 'request_changes'].includes(action)) {
            return NextResponse.json({ error: 'token and action (approve|request_changes) required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Validate token via campaign_batches
        const { data: post } = await supabase
            .from('posts')
            .select('campaign_batch_id, status')
            .eq('id', id)
            .single()

        if (!post?.campaign_batch_id) {
            return NextResponse.json({ error: 'Not part of a campaign batch' }, { status: 400 })
        }

        const { data: batch } = await supabase
            .from('campaign_batches')
            .select('public_token')
            .eq('id', post.campaign_batch_id)
            .single()

        if (!batch || batch.public_token !== token) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        if (action === 'approve') {
            const updates: any = { client_status: 'approved' }
            if (post.status === 'pending_approval') updates.status = 'approved'
            await supabase.from('posts').update(updates).eq('id', id)
        } else {
            await supabase.from('posts').update({
                client_status: 'changes_requested',
                status: 'draft'
            } as any).eq('id', id)
        }

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Client action error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Action failed' }, { status: 500 })
    }
}
