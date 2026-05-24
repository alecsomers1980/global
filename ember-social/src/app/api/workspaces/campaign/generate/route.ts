import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { getNextAvailableDate, clampHourToSastWindow, firstOfNextMonthUtc, SAST_WINDOW_UTC, weekdaysForPattern, nextSchedulePattern } from '@/lib/scheduling'
import { generateCampaign } from '@/lib/ai/campaignGenerator'
import { fetchVehiclesForWorkspace } from '@/lib/inventory/fetchVehicles'
import type { VehicleSummary } from '@/lib/inventory/fetchVehicles'
import { computeVehicleSlug } from '@/lib/inventory/vehicleSlug'
import { generateLifestyleImage } from '@/lib/media/generateLifestyleImage'
import { applyBrandOverlay } from '@/lib/media/applyBrandOverlay'
import { uploadCampaignImage } from '@/lib/media/uploadToStorage'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const { workspaceId, durationDays } = await req.json()
        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceId)
        const supabase = await createServerSupabaseClient()

        const [{ data: intel }, { data: socialAccounts }, { data: workspace }, { data: brandKit }, { data: wsName }] = await Promise.all([
            supabase.from('client_intelligence').select('*').eq('workspace_id', resolvedId).single(),
            supabase.from('social_accounts').select('platform').eq('workspace_id', resolvedId),
            supabase.from('workspaces')
                .select('content_source, client_supabase_url, client_supabase_service_key')
                .eq('id', resolvedId)
                .single(),
            supabase.from('brand_kits').select('logo_url, accent_color, primary_color').eq('workspace_id', resolvedId).maybeSingle(),
            supabase.from('workspaces').select('name').eq('id', resolvedId).single()
        ])

        const connectedPlatforms = (socialAccounts || []).map((a: any) => a.platform)
        const days = durationDays || 30
        const ws = workspace as any
        const logoUrl = (brandKit as any)?.logo_url || null
        const accentColor = (brandKit as any)?.accent_color || (brandKit as any)?.primary_color || '#FFE600'
        const workspaceName = (wsName as any)?.name || 'Ember Social'

        // ── Inventory: fetch vehicles if content_source.type === 'vehicles' ──
        const source = ws?.content_source || {}
        let vehicles: VehicleSummary[] = []
        if (source.type === 'vehicles' && ws?.client_supabase_url && ws?.client_supabase_service_key) {
            vehicles = await fetchVehiclesForWorkspace({
                clientSupabaseUrl: ws.client_supabase_url,
                clientServiceKey: ws.client_supabase_service_key,
                table: source.table || 'cars',
                fields: source.fields || 'id,make,model,year,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,slug,social_shared_at',
                filter: source.filter || {},
                limit: 40,
                notSharedWithinDays: source.vehicle_post_share_within_days || 30
            })
        }

        const result = await generateCampaign({
            workspaceId: resolvedId,
            durationDays: days,
            connectedPlatforms,
            intel,
            vehicles,
            siteBaseUrl: source.site_base_url,
            vehiclePathTemplate: source.vehicle_path_template
        })

        // Hour pool clamped to SAST publish window (UTC 07:00–15:00)
        const rawHours: number[] = Array.isArray((intel as any)?.best_performing_hours?.facebook)
            ? (intel as any).best_performing_hours.facebook
            : []
        const seedHours = rawHours.map(clampHourToSastWindow)
        const defaultPool = [7, 9, 11, 13, 15]
        const goodHours: number[] = []
        for (const h of [...seedHours, ...defaultPool]) {
            if (h >= SAST_WINDOW_UTC.minHour && h <= SAST_WINDOW_UTC.maxHour && !goodHours.includes(h)) {
                goodHours.push(h)
            }
        }
        if (goodHours.length === 0) goodHours.push(7)

        // Build vehicle lookup map
        const vehicleById = new Map<string, VehicleSummary>()
        for (const v of vehicles) {
            vehicleById.set(v.id, v)
        }

        const firstApprovalToken = crypto.randomUUID()
        const batchId = crypto.randomUUID()
        const publicToken = crypto.randomUUID()

        // A/B schedule pattern: alternate Tue/Thu/Sat <-> Mon/Wed/Fri per batch
        // so we can compare engagement and tune cadence over time.
        const { data: lastBatch } = await supabase
            .from('campaign_batches')
            .select('schedule_pattern')
            .eq('workspace_id', resolvedId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        const schedulePattern = nextSchedulePattern((lastBatch as any)?.schedule_pattern)
        const allowedWeekdays = weekdaysForPattern(schedulePattern)

        // Insert campaign batch record
        const { error: batchError } = await supabase
            .from('campaign_batches')
            .insert({
                id: batchId,
                workspace_id: resolvedId,
                public_token: publicToken,
                strategy_rationale: result.strategy_rationale,
                pillars: result.pillars,
                duration_days: days,
                schedule_pattern: schedulePattern,
            } as any)

        if (batchError) {
            console.error('[campaign/generate] batch insert failed:', batchError)
        }

        // Start scheduling from the first allowed weekday of next calendar month
        const startMonth = firstOfNextMonthUtc()
        while (!allowedWeekdays.includes(startMonth.getUTCDay())) {
            startMonth.setUTCDate(startMonth.getUTCDate() + 1)
        }

        let inserted = 0
        const errors: string[] = []

        for (let i = 0; i < result.posts.length; i++) {
            const post = result.posts[i]
            const approvalToken = i === 0 ? firstApprovalToken : crypto.randomUUID()
            const newPostId = crypto.randomUUID()
            try {
                const targetDate = new Date(startMonth)
                targetDate.setUTCDate(targetDate.getUTCDate() + (post.day_offset || 0))

                const hour = goodHours[i % goodHours.length]

                const scheduledDate = await getNextAvailableDate(supabase, resolvedId, {
                    startFrom: targetDate,
                    timeOfDay: { hour, minute: 0 },
                    allowedWeekdays,
                })

                const variants = post.variants || {}

                // Resolve vehicle data
                let vehicleId: string | null = null
                let vehicleAttachedUrls: string[] | null = null
                let resolvedFbContent: string | null = null

                if (post.vehicle_id && vehicleById.has(post.vehicle_id)) {
                    const v = vehicleById.get(post.vehicle_id)!
                    vehicleId = v.id

                    const images: string[] = []
                    if (v.main_image_url) images.push(v.main_image_url)
                    if (v.gallery_urls?.length) {
                        images.push(...v.gallery_urls.slice(0, 2))
                    }
                    vehicleAttachedUrls = images.length > 0 ? images : null

                    const fbVariant = variants.facebook
                    if (fbVariant?.content && fbVariant.content.includes('{slug}')) {
                        const slug = computeVehicleSlug(v)
                        resolvedFbContent = fbVariant.content.replace(/\{slug\}/g, slug)
                    }
                }

                let content = resolvedFbContent ||
                    variants.facebook?.content ||
                    (variants as any).instagram?.content ||
                    (variants as any).tiktok?.content ||
                    ''

                const resolvedVariants = resolvedFbContent && variants.facebook
                    ? { ...variants, facebook: { ...variants.facebook, content: resolvedFbContent } }
                    : variants

                const platforms = Object.keys(resolvedVariants).filter(k =>
                    ['facebook', 'instagram', 'tiktok'].includes(k) &&
                    (resolvedVariants as any)[k]?.content
                )

                // ── Image generation pipeline (best-effort, never blocks the post) ──
                let mediaUrls: string[] | null = null
                let imageStatus: string = 'skipped'

                if (post.image_prompt) {
                    imageStatus = 'generating'
                    const gen = await generateLifestyleImage({ prompt: post.image_prompt, aspectRatio: '4:5' })
                    if (gen.ok) {
                        const branded = await applyBrandOverlay({
                            baseImage: gen.bytes,
                            logoUrl,
                            workspaceName,
                            tagline: post.tagline || null,
                            taglineAccent: post.tagline_accent || null,
                            accentColor,
                        })
                        const up = await uploadCampaignImage({
                            workspaceId: resolvedId,
                            postId: newPostId,
                            bytes: branded
                        })
                        if (up.ok) {
                            mediaUrls = [up.publicUrl]
                            imageStatus = 'ready'
                        } else {
                            imageStatus = 'failed'
                            console.error(`[campaign/generate] post ${i} upload failed:`, up.error)
                            errors.push(`Post ${i} image upload failed: ${up.error}`)
                        }
                    } else {
                        imageStatus = 'failed'
                        console.error(`[campaign/generate] post ${i} gen failed:`, gen.error)
                        errors.push(`Post ${i} image gen failed: ${gen.error}`)
                    }
                    // Polite delay between Gemini calls.
                    await new Promise(r => setTimeout(r, 500))
                }

                // Fallback: use vehicle photos if image gen didn't produce media
                if (!mediaUrls && vehicleAttachedUrls) {
                    mediaUrls = vehicleAttachedUrls
                }

                const { error: insertError } = await supabase
                    .from('posts')
                    .insert({
                        id: newPostId,
                        workspace_id: resolvedId,
                        content,
                        variants: resolvedVariants,
                        pillar: post.pillar,
                        rationale: post.rationale,
                        platforms,
                        media_urls: mediaUrls,
                        vehicle_id: vehicleId,
                        image_prompt: post.image_prompt || null,
                        image_status: imageStatus,
                        tagline: post.tagline || null,
                        tagline_accent: post.tagline_accent || null,
                        scheduled_at: scheduledDate.toISOString(),
                        status: 'pending_approval',
                        approval_token: approvalToken,
                        campaign_batch_id: batchId
                    } as any)

                if (insertError) {
                    errors.push(`Post ${i}: ${insertError.message}`)
                } else {
                    inserted++
                }

                // Polite delay between Gemini calls
                if (post.image_prompt && i < result.posts.length - 1) {
                    await new Promise(r => setTimeout(r, 500))
                }
            } catch (e: any) {
                errors.push(`Post ${i}: ${e.message}`)
            }
        }

        return NextResponse.json({
            ok: true,
            count: inserted,
            approval_token: firstApprovalToken,
            public_token: publicToken,
            strategy_rationale: result.strategy_rationale,
            pillars: result.pillars,
            vehicles_available: vehicles.length,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error: any) {
        console.error('Campaign generate error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Generation failed' })
    }
}
