import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const EDITABLE_FIELDS = [
    'title', 'slug', 'excerpt', 'meta_title', 'meta_description',
    'body_md', 'hero_image_url', 'featured_vehicle_id', 'category', 'status',
]

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = admin()
        const { data, error } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw error
        return NextResponse.json({ article: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const update: Record<string, any> = {}
        for (const key of EDITABLE_FIELDS) {
            if (key in body) update[key] = body[key]
        }
        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No editable fields' }, { status: 400 })
        }

        const supabase = admin()
        const { data, error } = await supabase
            .from('news_articles')
            .update(update as never)
            .eq('id', id)
            .select('id')
            .single()
        if (error) throw error
        return NextResponse.json({ success: true, id: (data as any).id })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = admin()
        const { error } = await supabase.from('news_articles').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
