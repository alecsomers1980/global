import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { rewriteSocialContent } from '@/lib/ai/rewrite-content'
import crypto from 'crypto'

const MAX_CARS_PER_DAY = 1

function isSundayUtc(dateStr: string): boolean {
    // dateStr is YYYY-MM-DD; UTC day-of-week 0 = Sunday. The post times for
    // SAST clients (07:30/11:00/14:00 UTC = 09:30/13:00/16:00 SAST) sit inside
    // the same UTC calendar day, so checking UTC Sunday is correct here.
    return new Date(`${dateStr}T00:00:00Z`).getUTCDay() === 0
}

async function getNextAvailableDate(
    supabase: any,
    workspaceId: string,
    vehicleId: string,
    preferredTime?: string,
): Promise<string> {
    // Find the next date that has fewer than MAX_CARS_PER_DAY distinct vehicles scheduled.
    // The same vehicle can have multiple posts (feed/reel/video) on the same day.
    // Sundays are skipped per business rule.
    const now = new Date()

    // If this vehicle already has at least one future post scheduled, keep
    // every post in the same batch on that same day. Without this, each
    // call (feed/reel/video) is independent and the multi-post batch can
    // split across days when one preferred_time has already passed today.
    const { data: existing } = await supabase
        .from('posts')
        .select('scheduled_at')
        .eq('workspace_id', workspaceId)
        .eq('vehicle_id', vehicleId)
        .gte('scheduled_at', now.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
    const existingDate = (existing as any[] | null)?.[0]?.scheduled_at
    if (existingDate) {
        return existingDate.split('T')[0]
    }

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const checkDate = new Date(now)
        checkDate.setDate(checkDate.getDate() + dayOffset)
        const dateStr = checkDate.toISOString().split('T')[0] // YYYY-MM-DD

        if (isSundayUtc(dateStr)) continue

        // Skip today if the preferred time has already passed today —
        // otherwise the trigger writes a scheduled_at in the past and the
        // cron fires it immediately, not at the intended slot tomorrow.
        if (dayOffset === 0 && preferredTime) {
            const slot = new Date(`${dateStr}T${preferredTime}:00Z`)
            if (slot.getTime() <= now.getTime()) continue
        }

        // Count distinct vehicle_ids scheduled on this date
        const { data: posts } = await supabase
            .from('posts')
            .select('vehicle_id')
            .eq('workspace_id', workspaceId)
            .gte('scheduled_at', `${dateStr}T00:00:00Z`)
            .lt('scheduled_at', `${dateStr}T23:59:59Z`)
            .not('vehicle_id', 'is', null)

        const uniqueVehicles = new Set((posts || []).map((p: any) => p.vehicle_id))
        // Exclude the current vehicle — its multiple post types share the same day
        uniqueVehicles.delete(vehicleId)

        if (uniqueVehicles.size < MAX_CARS_PER_DAY) {
            return dateStr
        }
    }

    // Fallback: 30 days out, also rolling forward off Sunday if needed
    const fallback = new Date(now)
    fallback.setDate(fallback.getDate() + 30)
    let fallbackStr = fallback.toISOString().split('T')[0]
    while (isSundayUtc(fallbackStr)) {
        const next = new Date(`${fallbackStr}T00:00:00Z`)
        next.setUTCDate(next.getUTCDate() + 1)
        fallbackStr = next.toISOString().split('T')[0]
    }
    return fallbackStr
}

export async function POST(req: Request) {
    try {
        // 1. Authenticate Request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer es_')) {
            return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 })
        }

        const rawKey = authHeader.replace('Bearer ', '')
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

        const supabase = await createServerSupabaseClient()

        // 2. Lookup Key in DB
        const { data: keyRecord } = await supabase
            .from('workspace_api_keys')
            .select('id, workspace_id')
            .eq('key_hash', keyHash)
            .single()

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
        const { content, platforms, scheduled_at, media_urls, preferred_time, vehicle_id } = payload

        if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return NextResponse.json({ error: 'Missing content or platforms array' }, { status: 400 })
        }

        // 5. Smart scheduling
        let finalScheduledAt: string | null = null

        if (scheduled_at) {
            // Explicit date provided — use it directly
            finalScheduledAt = new Date(scheduled_at).toISOString()
        } else if (preferred_time && vehicle_id) {
            // Smart scheduling: find next available day, apply preferred time
            const availableDate = await getNextAvailableDate(supabase, keyAny.workspace_id, vehicle_id, preferred_time)
            finalScheduledAt = `${availableDate}T${preferred_time}:00Z`
        }

        // 6. Rewrite content for social media
        let rewrittenContent = content
        try {
            rewrittenContent = await rewriteSocialContent(content, platforms, keyAny.workspace_id)
        } catch (err) {
            console.error('Content rewrite failed, using original:', err)
        }

        // 7. Insert Post
        const approval_token = crypto.randomUUID()

        const insertData: Record<string, any> = {
            workspace_id: keyAny.workspace_id,
            content: rewrittenContent,
            platforms,
            media_urls: Array.isArray(media_urls) && media_urls.length > 0 ? media_urls : null,
            scheduled_at: finalScheduledAt,
            status: 'pending_approval',
            approval_token,
        }

        // Store vehicle_id if provided (for scheduling logic)
        if (vehicle_id) {
            insertData.vehicle_id = vehicle_id
        }

        const { data: post, error: insertError } = await supabase
            .from('posts')
            .insert(insertData as never)
            .select('id, status, approval_token, scheduled_at')
            .single()

        if (insertError) throw insertError

        const postAny = post as any
        return NextResponse.json({
            success: true,
            message: 'Post queued successfully',
            post_id: postAny?.id,
            status: postAny?.status,
            scheduled_at: postAny?.scheduled_at,
        }, { status: 201 })

    } catch (error: any) {
        console.error('Trigger API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
