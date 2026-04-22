import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pushArticleToClient, unpublishOnClient } from '@/lib/news-client-push'

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { action } = (await req.json().catch(() => ({}))) as { action?: 'publish' | 'unpublish' }
        const supabase = admin()

        const { data: article, error: loadErr } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', id)
            .single()
        if (loadErr || !article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

        const art: any = article

        const { data: workspace } = await supabase
            .from('workspaces')
            .select('client_supabase_url, client_supabase_service_key, client_news_table, client_site_url')
            .eq('id', art.workspace_id)
            .single()
        const ws: any = workspace || {}

        if (action === 'unpublish') {
            if (art.remote_post_id) {
                await unpublishOnClient(ws, art.remote_post_id).catch((e) => console.warn('unpublish remote:', e))
            }
            const { error } = await supabase
                .from('news_articles')
                .update({ status: 'approved', published_at: null } as never)
                .eq('id', id)
            if (error) throw error
            return NextResponse.json({ success: true, status: 'approved' })
        }

        // Publish flow
        const nowIso = new Date().toISOString()
        const { remoteId } = await pushArticleToClient(ws, {
            category: art.category,
            title: art.title,
            slug: art.slug,
            excerpt: art.excerpt,
            meta_title: art.meta_title,
            meta_description: art.meta_description,
            body_md: art.body_md,
            hero_image_url: art.hero_image_url,
            featured_vehicle_id: art.featured_vehicle_id,
            status: 'published',
            published_at: nowIso,
        }, art.remote_post_id || null)

        const { error } = await supabase
            .from('news_articles')
            .update({
                status: 'published',
                published_at: nowIso,
                remote_post_id: remoteId,
                remote_synced_at: nowIso,
            } as never)
            .eq('id', id)
        if (error) throw error

        // Fire IndexNow ping if client site URL is set
        if (ws.client_site_url) {
            const urls = [
                `${ws.client_site_url}/news`,
                `${ws.client_site_url}/news/${art.slug}`,
                `${ws.client_site_url}/sitemap.xml`,
            ]
            // Fire-and-forget ping; don't block response
            fetch('https://api.indexnow.org/indexnow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: new URL(ws.client_site_url).host,
                    key: process.env.INDEXNOW_KEY || 'missing',
                    urlList: urls,
                }),
            }).catch((e) => console.warn('IndexNow ping:', e))
        }

        return NextResponse.json({ success: true, status: 'published', remoteId })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
