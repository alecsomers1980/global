import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { generateLifestyleImage } from '@/lib/media/generateLifestyleImage'
import { applyBrandOverlay } from '@/lib/media/applyBrandOverlay'
import { uploadCampaignImage } from '@/lib/media/uploadToStorage'

const MAX_AUTO_REGENERATIONS = 3

/**
 * Client-side "Request Changes" with a reason. Behaviour:
 * - Always logs the reason as a post_feedback row (author_role='client').
 * - If regeneration_count < 3: regenerates the image using the original prompt
 *   + the client's reason as a refinement hint. Bumps the count. The post
 *   stays pending_approval so the client can review the new image.
 * - If regeneration_count >= 3: marks the post as referred_to_agency, sets
 *   posts.status='draft' (cron won't publish), client_status='changes_requested'.
 *   No new image is generated — the agency handles it.
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
            .select('id, workspace_id, image_prompt, tagline, tagline_accent, campaign_batch_id, regeneration_count, referred_to_agency')
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

        if (!p.image_prompt) {
            return NextResponse.json({ ok: false, error: 'Post has no image_prompt to regenerate from' }, { status: 400 })
        }

        const [{ data: brandKit }, { data: ws }] = await Promise.all([
            supabase.from('brand_kits').select('logo_url, accent_color, primary_color').eq('workspace_id', p.workspace_id).maybeSingle(),
            supabase.from('workspaces').select('name').eq('id', p.workspace_id).maybeSingle(),
        ])
        const logoUrl = (brandKit as any)?.logo_url || null
        const accentColor = (brandKit as any)?.accent_color || (brandKit as any)?.primary_color || '#FFE600'
        const workspaceName = (ws as any)?.name || 'Ember Social'

        // Build a refined prompt: keep the original, append the feedback hint.
        // gpt-image-1 generates from scratch each call, so we just pass an
        // augmented prompt rather than try to "edit" the previous image.
        const refinedPrompt = `${p.image_prompt}

Client feedback on the previous attempt: "${cleanReason}". Address this feedback while keeping the overall South African setting and brand requirements (logo placement is handled by post-processing — no text overlay, no logos in the generated image).`

        await supabase.from('posts').update({ image_status: 'generating' } as never).eq('id', postId)

        const gen = await generateLifestyleImage({ prompt: refinedPrompt, aspectRatio: '4:5' })
        if (!gen.ok) {
            await supabase.from('posts').update({ image_status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({ ok: false, error: gen.error })
        }

        const branded = await applyBrandOverlay({
            baseImage: gen.bytes,
            logoUrl,
            workspaceName,
            tagline: p.tagline || null,
            taglineAccent: p.tagline_accent || null,
            accentColor,
        })

        const up = await uploadCampaignImage({ workspaceId: p.workspace_id, postId, bytes: branded })
        if (!up.ok) {
            await supabase.from('posts').update({ image_status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({ ok: false, error: up.error })
        }

        await supabase
            .from('posts')
            .update({
                media_urls: [up.publicUrl],
                image_status: 'ready',
                image_prompt: refinedPrompt,
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
