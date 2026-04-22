import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = admin()

        const { data: workspace, error: wsErr } = await supabase
            .from('workspaces')
            .select('client_supabase_url, client_supabase_service_key, client_news_table, client_site_url')
            .eq('id', id)
            .single()
        if (wsErr || !workspace) {
            return NextResponse.json({ ok: false, error: 'Workspace not found' }, { status: 404 })
        }

        const ws: any = workspace
        const url = ws.client_supabase_url
        const key = ws.client_supabase_service_key
        const table = ws.client_news_table || 'news_posts'

        const checks: Array<{ name: string; ok: boolean; detail?: string }> = []

        if (!url || !key) {
            return NextResponse.json({
                ok: false,
                checks: [{ name: 'Credentials present', ok: false, detail: 'client_supabase_url or service key missing' }],
            })
        }
        checks.push({ name: 'Credentials present', ok: true })

        let remote
        try {
            remote = createClient(url, key, { auth: { persistSession: false } })
            checks.push({ name: 'Supabase URL + service key accepted', ok: true })
        } catch (e: any) {
            checks.push({ name: 'Supabase URL + service key accepted', ok: false, detail: e.message })
            return NextResponse.json({ ok: false, checks })
        }

        // Probe the news_posts table with a limited select + column shape check.
        const { data: rows, error: selErr } = await remote
            .from(table)
            .select('id, slug, title, status, category, featured_car_id')
            .limit(1)
        if (selErr) {
            checks.push({
                name: `Can read ${table}`,
                ok: false,
                detail: selErr.message,
            })
            return NextResponse.json({ ok: false, checks })
        }
        checks.push({ name: `Can read ${table}`, ok: true, detail: `${rows?.length ?? 0} sample row(s)` })

        // Dry-run insert check: insert a harmless row marked as draft then delete it,
        // so we confirm write + delete permissions without polluting the live site.
        const probeSlug = `ember-probe-${Date.now()}`
        const { data: inserted, error: insErr } = await remote
            .from(table)
            .insert({
                slug: probeSlug,
                title: 'Ember-Social connection probe',
                category: 'buying-guide',
                body_md: 'probe',
                status: 'draft',
                generated_by_ai: true,
            } as never)
            .select('id')
            .single()
        if (insErr) {
            checks.push({ name: 'Can insert into news_posts', ok: false, detail: insErr.message })
            return NextResponse.json({ ok: false, checks })
        }
        checks.push({ name: 'Can insert into news_posts', ok: true })

        const { error: delErr } = await remote
            .from(table)
            .delete()
            .eq('id', (inserted as any).id)
        checks.push({
            name: 'Can delete from news_posts',
            ok: !delErr,
            detail: delErr?.message,
        })

        // Optional: hit the client site URL if set.
        if (ws.client_site_url) {
            try {
                const ping = await fetch(ws.client_site_url, { method: 'HEAD', redirect: 'follow' })
                checks.push({
                    name: 'Client site reachable',
                    ok: ping.ok || (ping.status >= 200 && ping.status < 500),
                    detail: `${ping.status}`,
                })
            } catch (e: any) {
                checks.push({ name: 'Client site reachable', ok: false, detail: e.message })
            }
        }

        const allOk = checks.every((c) => c.ok)
        return NextResponse.json({ ok: allOk, checks })
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
