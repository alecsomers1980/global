import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { generateLifestyleImage } from '@/lib/media/generateLifestyleImage'
import { applyBrandOverlay } from '@/lib/media/applyBrandOverlay'
import { uploadCampaignImage } from '@/lib/media/uploadToStorage'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: postId } = await params
        const body = await req.json().catch(() => ({}))
        const overridePrompt: string | undefined = body?.imagePrompt

        const supabase = createAdminClient()

        const { data: post, error: postErr } = await supabase
            .from('posts')
            .select('id, workspace_id, image_prompt, tagline, tagline_accent')
            .eq('id', postId)
            .single()
        if (postErr || !post) {
            return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
        }
        const p = post as any
        const prompt = overridePrompt || p.image_prompt
        if (!prompt) {
            return NextResponse.json({ ok: false, error: 'Post has no image_prompt' }, { status: 400 })
        }

        const [{ data: brandKit }, { data: ws }] = await Promise.all([
            supabase.from('brand_kits').select('logo_url, accent_color, primary_color').eq('workspace_id', p.workspace_id).maybeSingle(),
            supabase.from('workspaces').select('name').eq('id', p.workspace_id).maybeSingle(),
        ])
        const logoUrl = (brandKit as any)?.logo_url || null
        const accentColor = (brandKit as any)?.accent_color || (brandKit as any)?.primary_color || '#FFE600'
        const workspaceName = (ws as any)?.name || 'Ember Social'

        await supabase.from('posts').update({ image_status: 'generating' } as never).eq('id', postId)

        const gen = await generateLifestyleImage({ prompt, aspectRatio: '4:5' })
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

        const updatePayload: Record<string, any> = {
            media_urls: [up.publicUrl],
            image_status: 'ready',
        }
        if (overridePrompt) updatePayload.image_prompt = overridePrompt

        await supabase.from('posts').update(updatePayload as never).eq('id', postId)

        return NextResponse.json({ ok: true, mediaUrl: up.publicUrl })
    } catch (error: any) {
        console.error('regenerate-image error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Regenerate failed' }, { status: 500 })
    }
}
