import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const body = await req.json()
        const { postId, status, content, variants, first_comment, platforms, media_urls, scheduled_at } = body

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }

        const updates: Record<string, any> = {}

        if (status) updates.status = status

        // Per-platform variants update
        if (variants) {
            // Mirror facebook content to posts.content for publish.ts back-compat
            if (variants.facebook?.content) {
                updates.content = variants.facebook.content
            }
            updates.variants = variants
        } else if (content) {
            updates.content = content
        }

        // First comment (Instagram) — strip HTML, cap 500 chars
        if (typeof first_comment === 'string') {
            const clean = first_comment.replace(/<[^>]+>/g, '').slice(0, 500)
            updates.first_comment = clean || null
        }

        if (platforms) {
            updates.platforms = platforms
        }

        if (media_urls) {
            updates.media_urls = media_urls
        }

        if (scheduled_at) {
            updates.scheduled_at = scheduled_at
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
        }

        const { error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
