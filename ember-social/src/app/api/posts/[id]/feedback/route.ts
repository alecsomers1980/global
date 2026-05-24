import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { token, author_name, comment, role } = body || {}

        if (!token || !comment) {
            return NextResponse.json({ error: 'token and comment required' }, { status: 400 })
        }

        const clean = comment.replace(/<[^>]+>/g, '').slice(0, 2000)
        if (!clean) {
            return NextResponse.json({ error: 'comment is empty after stripping HTML' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Validate token via campaign_batches
        const { data: post } = await supabase
            .from('posts')
            .select('campaign_batch_id')
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

        const { data: feedback, error } = await supabase
            .from('post_feedback')
            .insert({
                post_id: id,
                author_name: author_name?.trim() || 'Client',
                author_role: role === 'agency' ? 'agency' : 'client',
                comment: clean
            } as any)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ ok: true, feedback })
    } catch (error: any) {
        console.error('Feedback POST error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Failed to save feedback' }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = new URL(req.url).searchParams.get('token')
        if (!token) {
            return NextResponse.json({ error: 'token required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Validate token
        const { data: post } = await supabase
            .from('posts')
            .select('campaign_batch_id')
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

        const { data: feedback } = await supabase
            .from('post_feedback')
            .select('*')
            .eq('post_id', id)
            .order('created_at', { ascending: false })

        return NextResponse.json({ feedback: feedback || [] })
    } catch (error: any) {
        console.error('Feedback GET error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Failed to fetch feedback' }, { status: 500 })
    }
}
