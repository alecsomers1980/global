import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { generateNewsArticle, pickNextCategory, slugify, type NewsCategory } from '@/lib/ai/newsGenerator'

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const workspaceParam = searchParams.get('workspaceId')
        if (!workspaceParam) return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })

        const workspaceId = await resolveWorkspaceId(workspaceParam)
        const supabase = admin()

        const { data, error } = await supabase
            .from('news_articles')
            .select('id, category, title, slug, excerpt, status, hero_image_url, featured_vehicle_id, published_at, remote_synced_at, created_at, updated_at')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ articles: data || [] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { workspaceId: workspaceParam, category, featuredCarId } = body || {}
        if (!workspaceParam) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })

        const workspaceId = await resolveWorkspaceId(workspaceParam)
        const supabase = admin()

        const [{ data: workspaceRow }, { data: intel }] = await Promise.all([
            supabase.from('workspaces').select('name, client_site_url').eq('id', workspaceId).single(),
            supabase.from('client_intelligence').select('*').eq('workspace_id', workspaceId).single(),
        ])
        const ws: any = workspaceRow || {}
        const intelAny: any = intel || {}

        const { data: recent } = await supabase
            .from('news_articles')
            .select('title, category')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(10)
        const recentList: any[] = recent || []

        const chosenCategory: NewsCategory =
            (category as NewsCategory) ||
            pickNextCategory(recentList.map(r => r.category as NewsCategory))

        let featuredCar: any = null
        if (featuredCarId && (chosenCategory === 'model-review')) {
            featuredCar = { id: featuredCarId }
        }

        const article = await generateNewsArticle({
            category: chosenCategory,
            recentTitles: recentList.map(r => r.title).filter(Boolean),
            featuredCar,
            brand: {
                businessName: ws.name,
                industry: intelAny.industry,
                audience: intelAny.target_audience,
                voice: intelAny.brand_voice,
                location: intelAny.service_area || intelAny.location,
            },
        })

        // Ensure unique slug within workspace
        let finalSlug = article.slug || slugify(article.title)
        for (let i = 0; i < 25; i++) {
            const { data: clash } = await supabase
                .from('news_articles')
                .select('id')
                .eq('workspace_id', workspaceId)
                .eq('slug', finalSlug)
                .maybeSingle()
            if (!clash) break
            finalSlug = `${article.slug}-${Math.random().toString(36).slice(2, 6)}`
        }

        const insert = {
            workspace_id: workspaceId,
            category: article.category,
            title: article.title,
            slug: finalSlug,
            excerpt: article.excerpt,
            meta_title: article.meta_title,
            meta_description: article.meta_description,
            body_md: article.body_md,
            hero_image_url: article.hero_image_url || null,
            featured_vehicle_id: article.featured_vehicle_id,
            status: 'pending_approval',
        }

        const { data: saved, error } = await supabase
            .from('news_articles')
            .insert(insert as never)
            .select('id')
            .single()
        if (error) throw error

        return NextResponse.json({ success: true, id: (saved as any).id }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
