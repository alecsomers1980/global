import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { publishPost } from '@/lib/publish'

export const maxDuration = 300;

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function authorized(req: Request): boolean {
    const secret = process.env.CRON_SECRET
    if (!secret) return process.env.NODE_ENV !== 'production'
    const auth = req.headers.get('authorization') || ''
    return auth === `Bearer ${secret}`
}

export async function GET(req: Request) {
    if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const supabase = admin()

        const { data: posts } = await supabase
            .from('posts')
            .select('id, content')
            .eq('status', 'approved')
            .not('scheduled_at', 'is', null)
            .lte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(10)

        if (!posts || posts.length === 0) {
            return NextResponse.json({ success: true, published: 0 })
        }

        const results: any[] = []
        for (const post of posts as any[]) {
            const outcome = await publishPost(post.id)
            results.push({ postId: post.id, ...outcome })
        }

        return NextResponse.json({ success: true, published: posts.length, results })
    } catch (error: any) {
        console.error('publish-scheduled cron error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
