import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const workspaceParam = searchParams.get('workspaceId')
        if (!workspaceParam) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceParam)
        const supabase = createAdminClient()

        const [intelRes, brandRes, wsRes] = await Promise.all([
            supabase.from('client_intelligence').select('*').eq('workspace_id', resolvedId).maybeSingle(),
            supabase.from('brand_kits').select('*').eq('workspace_id', resolvedId).maybeSingle(),
            supabase.from('workspaces').select('content_source, business_archetype, contact_phone, contact_email, website_url, location, default_hashtags, sell_your_car_url').eq('id', resolvedId).maybeSingle(),
        ])

        const ws = (wsRes.data as any) || {}
        return NextResponse.json({
            workspaceId: resolvedId,
            intel: intelRes.data || null,
            brandKit: brandRes.data || null,
            contentSource: ws.content_source || null,
            businessArchetype: ws.business_archetype || null,
            contactPhone: ws.contact_phone || null,
            contactEmail: ws.contact_email || null,
            websiteUrl: ws.website_url || null,
            location: ws.location || null,
            defaultHashtags: ws.default_hashtags || [],
            sellYourCarUrl: ws.sell_your_car_url || null,
        })
    } catch (error: any) {
        console.error('intelligence GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const workspaceParam = searchParams.get('workspaceId')
        if (!workspaceParam) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceParam)
        const supabase = createAdminClient()
        const body = await req.json()

        const fields: Record<string, any> = {}
        if ('contactPhone' in body) fields.contact_phone = body.contactPhone
        if ('contactEmail' in body) fields.contact_email = body.contactEmail
        if ('websiteUrl' in body) fields.website_url = body.websiteUrl
        if ('location' in body) fields.location = body.location
        if ('defaultHashtags' in body) fields.default_hashtags = body.defaultHashtags
        if ('sellYourCarUrl' in body) fields.sell_your_car_url = body.sellYourCarUrl

        if (Object.keys(fields).length === 0) {
            return NextResponse.json({ ok: true })
        }

        const { error } = await supabase
            .from('workspaces')
            .update(fields)
            .eq('id', resolvedId)

        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('intelligence PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
