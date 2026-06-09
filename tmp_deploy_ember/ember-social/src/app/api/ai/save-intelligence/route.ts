import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { workspaceId, intel } = body

        if (!workspaceId) return NextResponse.json({ error: 'Missing Workspace ID' }, { status: 400 })

        const resolvedId = await resolveWorkspaceId(workspaceId)

        // Initialize Supabase with Service Role Key to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from('client_intelligence')
            .upsert({
                workspace_id: resolvedId,
                industry: intel.industry,
                target_audience: intel.target_audience,
                brand_voice: intel.brand_voice,
                goals: intel.goals,
                current_month_focus: intel.current_month_focus,
                key_messages: intel.key_messages,
                do_not_post: intel.do_not_post,
                last_updated_at: new Date().toISOString()
            }, { onConflict: 'workspace_id' })
            .select()
            .single()

        if (error) {
            console.error('Database upsert error:', error)
            throw error
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('Save intelligence error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
