import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const EDITABLE_FIELDS = [
    'name',
    'client_site_url',
    'client_supabase_url',
    'client_supabase_service_key',
    'client_news_table',
]

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
            .from('workspaces')
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
