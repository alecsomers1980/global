import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    try {
        const { workspaceId, brandKit } = await req.json()

        if (!workspaceId) return NextResponse.json({ error: 'Missing Workspace ID' }, { status: 400 })

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from('brand_kits')
            .upsert({
                workspace_id: workspaceId,
                logo_url: brandKit.logo_url || null,
                primary_color: brandKit.primary_color || '#f97316',
                secondary_color: brandKit.secondary_color || '#1a1a27',
                accent_color: brandKit.accent_color || '#fbbf24',
                font_preference: brandKit.font_preference || 'Inter',
                watermark_url: brandKit.watermark_url || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'workspace_id' })
            .select()
            .single()

        if (error) {
            console.error('Brand kit upsert error:', error)
            throw error
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('Save brand kit error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
