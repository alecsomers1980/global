import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { fetchVehiclesForWorkspace } from '@/lib/inventory/fetchVehicles'
import { uploadCampaignImage } from '@/lib/media/uploadToStorage'
import { renderShowcase, renderLifestyle, renderMaintenance, renderSeasonal, renderSellYourCar } from '@/lib/templates'
import { generateFreshHeadlines } from '@/lib/templates/headlineGenerator'
import type { VehicleInput } from '@/lib/templates'

const MAX_AUTO_REGENERATIONS = 3

const RENDERERS: Record<string, any> = {
    showcase: renderShowcase,
    lifestyle: renderLifestyle,
    maintenance: renderMaintenance,
    seasonal: renderSeasonal,
    sellYourCar: renderSellYourCar,
}
const CAR_PILLARS = new Set(['showcase', 'lifestyle', 'seasonal'])

function currentSASeason(): string {
    const m = new Date().getUTCMonth()
    if (m >= 10 || m <= 1) return 'festive_summer'
    if (m >= 2 && m <= 4) return 'autumn'
    if (m >= 5 && m <= 7) return 'winter'
    return 'spring'
}

/**
 * Client-side "Request Changes" with a reason. Behaviour:
 * - Always logs the reason as a post_feedback row (author_role='client').
 * - If regeneration_count < 3: re-renders the post via its PILLAR template with a
 *   fresh headline overlay (so the text overlay changes). Bumps the count. The post
 *   stays pending_approval. Only the image is swapped — the caption is preserved.
 * - If regeneration_count >= 3: refers to the agency (status='draft'), no regen.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: postId } = await params
        const body = await req.json().catch(() => ({}))
        const { token, reason, author_name } = body || {}

        if (!token) {
            return NextResponse.json({ ok: false, error: 'token required' }, { status: 400 })
        }
        const cleanReason = String(reason || '').replace(/<[^>]+>/g, '').slice(0, 2000).trim()
        if (!cleanReason) {
            return NextResponse.json({ ok: false, error: 'Please describe what you would like changed' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { data: post } = await supabase
            .from('posts')
            .select('id, workspace_id, pillar, vehicle_id, campaign_batch_id, regeneration_count, referred_to_agency')
            .eq('id', postId)
            .single()
        if (!post) {
            return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
        }
        const p = post as any

        if (!p.campaign_batch_id) {
            return NextResponse.json({ ok: false, error: 'Not part of a campaign batch' }, { status: 400 })
        }

        const { data: batch } = await supabase
            .from('campaign_batches')
            .select('public_token')
            .eq('id', p.campaign_batch_id)
            .single()
        if (!batch || (batch as any).public_token !== token) {
            return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 403 })
        }

        // Always log the reason as feedback
        await supabase
            .from('post_feedback')
            .insert({
                post_id: postId,
                author_name: String(author_name || '').trim() || 'Client',
                author_role: 'client',
                comment: cleanReason,
            } as any)

        const currentCount = p.regeneration_count || 0

        // Hit the limit — refer to agency, do not regenerate
        if (currentCount >= MAX_AUTO_REGENERATIONS) {
            await supabase
                .from('posts')
                .update({
                    referred_to_agency: true,
                    client_status: 'changes_requested',
                    status: 'draft',
                } as never)
                .eq('id', postId)
            return NextResponse.json({
                ok: true,
                referred: true,
                regenerationsUsed: currentCount,
                maxRegenerations: MAX_AUTO_REGENERATIONS,
                message: `You've used all ${MAX_AUTO_REGENERATIONS} regenerations. This post has been referred to the agency for manual review.`,
            })
        }

        const pillar = String(p.pillar || '')
        const render = RENDERERS[pillar]
        if (!render) {
            // Custom-built posts (finance, comparison, carousel, and the human-labelled
            // batch pillars like "Vehicle showcase") aren't produced by the template
            // renderers, so they can't be auto-regenerated. The reason is already logged
            // above — route the request to the agency for a manual update instead of erroring.
            await supabase
                .from('posts')
                .update({
                    referred_to_agency: true,
                    client_status: 'changes_requested',
                    status: 'draft',
                } as never)
                .eq('id', postId)
            return NextResponse.json({
                ok: true,
                referred: true,
                regenerationsUsed: currentCount,
                maxRegenerations: MAX_AUTO_REGENERATIONS,
                message: 'Thanks — your change has been sent to our team to update manually.',
            })
        }

        // Re-fetch the vehicle for car pillars (needed to re-render the image).
        let car: VehicleInput = { id: p.vehicle_id || 'na', make: 'Everest', model: 'Vehicle', year: '' }
        if (CAR_PILLARS.has(pillar) && p.vehicle_id) {
            const { data: ws } = await supabase
                .from('workspaces')
                .select('client_supabase_url, client_supabase_service_key')
                .eq('id', p.workspace_id)
                .maybeSingle()
            const w = ws as any
            if (w?.client_supabase_url && w?.client_supabase_service_key) {
                const found = await fetchVehiclesForWorkspace({
                    clientSupabaseUrl: w.client_supabase_url,
                    clientServiceKey: w.client_supabase_service_key,
                    filter: { id: `eq.${p.vehicle_id}` },
                    limit: 1,
                    notSharedWithinDays: 0,
                })
                if (found[0]) car = found[0] as VehicleInput
            }
        }

        await supabase.from('posts').update({ image_status: 'generating' } as never).eq('id', postId)

        // Fresh headline for the new overlay. One AI headline keeps it on-brand and
        // genuinely different; fall back to a bumped curated index if the AI is unavailable.
        let headline: any = null
        try {
            const fresh = await generateFreshHeadlines({ count: 1, season: currentSASeason() })
            const key = pillar === 'sellYourCar' ? 'showcase' : pillar // sellYourCar has no AI bucket; reuse showcase-style
            headline = fresh ? (fresh as any)[key]?.[0] ?? null : null
        } catch { /* fall back to curated pool via variantIndex */ }

        let result
        try {
            result = await render(car, {
                variantIndex: currentCount + 1,   // different curated headline if AI headline is null
                headline,
            })
        } catch (e: any) {
            await supabase.from('posts').update({ image_status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({ ok: false, error: e?.message || 'Re-render failed' }, { status: 500 })
        }

        const up = await uploadCampaignImage({ workspaceId: p.workspace_id, postId, bytes: result.image })
        if (!up.ok) {
            await supabase.from('posts').update({ image_status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({ ok: false, error: up.error })
        }

        // Swap only the image — keep the existing caption untouched.
        await supabase
            .from('posts')
            .update({
                media_urls: [up.publicUrl],
                image_status: 'ready',
                regeneration_count: currentCount + 1,
            } as never)
            .eq('id', postId)

        return NextResponse.json({
            ok: true,
            referred: false,
            mediaUrl: up.publicUrl,
            regenerationsUsed: currentCount + 1,
            maxRegenerations: MAX_AUTO_REGENERATIONS,
            regenerationsLeft: MAX_AUTO_REGENERATIONS - (currentCount + 1),
        })
    } catch (error: any) {
        console.error('request-image-change error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Request failed' }, { status: 500 })
    }
}
