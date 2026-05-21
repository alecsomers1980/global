import { NextResponse } from 'next/server'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    try {
        const { workspaceId, websiteUrl } = await req.json()
        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceId)

        const [brandResult, websiteResult, socialResult] = await Promise.allSettled([
            fetch(`${baseUrl}/api/ai/analyze-brand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: websiteUrl || '' })
            }).then(r => r.json()),
            fetch(`${baseUrl}/api/ai/analyze-website`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: websiteUrl || '' })
            }).then(r => r.json()),
            fetch(`${baseUrl}/api/ai/analyze-social-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId })
            }).then(r => r.json())
        ])

        const supabase = await createServerSupabaseClient()

        // ── Brand scan ──
        let brandStatus: 'ok' | 'failed' = 'failed'
        let brandData: any = null
        if (brandResult.status === 'fulfilled' && brandResult.value && !brandResult.value.error) {
            brandData = brandResult.value
            const { error } = await supabase
                .from('brand_kits')
                .upsert({
                    workspace_id: resolvedId,
                    primary_color: brandData.primary_color,
                    secondary_color: brandData.secondary_color,
                    accent_color: brandData.accent_color,
                    font_preference: brandData.font_preference,
                    logo_url: brandData.logo_url
                }, { onConflict: 'workspace_id' })
            if (!error) brandStatus = 'ok'
        }

        // ── Website scan ──
        let websiteStatus: 'ok' | 'failed' = 'failed'
        let websiteData: any = null
        if (websiteResult.status === 'fulfilled' && websiteResult.value && !websiteResult.value.error) {
            websiteData = websiteResult.value
            const { error } = await supabase
                .from('client_intelligence')
                .upsert({
                    workspace_id: resolvedId,
                    industry: websiteData.industry,
                    target_audience: websiteData.target_audience,
                    brand_voice: websiteData.brand_voice,
                    goals: websiteData.goals,
                    key_messages: websiteData.key_messages,
                    last_updated_at: new Date().toISOString()
                }, { onConflict: 'workspace_id' })
            if (!error) websiteStatus = 'ok'
        }

        // ── Social scan ──
        let socialStatus: 'ok' | 'failed' | 'skipped' = 'failed'
        let socialData: any = null
        if (socialResult.status === 'fulfilled') {
            socialData = socialResult.value
            socialStatus = socialData?.ok ? 'ok' : 'failed'
        }

        return NextResponse.json({
            brand: brandStatus,
            website: websiteStatus,
            social: socialStatus,
            results: {
                brand: brandData,
                website: websiteData,
                social: socialData
            }
        })
    } catch (error: any) {
        console.error('Intake run error:', error)
        return NextResponse.json({
            brand: 'failed',
            website: 'failed',
            social: 'failed',
            results: {}
        })
    }
}
