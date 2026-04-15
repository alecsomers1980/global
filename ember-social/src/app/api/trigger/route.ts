import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        // 1. Authenticate Request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer es_')) {
            return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 })
        }

        const rawKey = authHeader.replace('Bearer ', '')
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
        console.log('--- DEBUG: TRIGGER API ---')
        console.log('Incoming rawKey length:', rawKey.length)
        console.log('Incoming keyHash:', keyHash)

        const supabase = await createServerSupabaseClient()

        // 2. Lookup Key in DB
        const { data: keyRecord, error: dbError } = await supabase
            .from('workspace_api_keys')
            .select('id, workspace_id')
            .eq('key_hash', keyHash)
            .single()

        if (dbError) {
          console.log('DB Search error:', dbError.message)
        }
        console.log('KeyRecord found:', !!keyRecord)

        if (!keyRecord) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 })
        }

        // 3. Update Last Used
        const keyAny = keyRecord as any
        await supabase
            .from('workspace_api_keys')
            .update({ last_used_at: new Date().toISOString() } as never)
            .eq('id', keyAny.id)

        // 4. Parse Payload
        const payload = await req.json()
        const { content, platforms, scheduled_at, media_urls } = payload

        if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return NextResponse.json({ error: 'Missing content or platforms array' }, { status: 400 })
        }

        // 5. Insert Post into Database
        // Triggers default to 'pending_approval' unless explicitly requested otherwise (if logic allowed)
        const approval_token = crypto.randomUUID()

        const { data: post, error: insertError } = await supabase
            .from('posts')
            .insert({
                workspace_id: keyAny.workspace_id,
                content,
                platforms,
                media_urls: Array.isArray(media_urls) && media_urls.length > 0 ? media_urls : null,
                scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
                status: 'pending_approval',
                approval_token,
            } as never)
            .select('id, status, approval_token')
            .single()

        if (insertError) throw insertError

        const postAny = post as any
        return NextResponse.json({
            success: true,
            message: 'Post queued successfully',
            post_id: postAny?.id,
            status: postAny?.status
        }, { status: 201 })

    } catch (error: any) {
        console.error('Trigger API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
