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
            supabase.from('workspaces').select('content_source').eq('id', resolvedId).maybeSingle(),
        ])

        return NextResponse.json({
            workspaceId: resolvedId,
            intel: intelRes.data || null,
            brandKit: brandRes.data || null,
            contentSource: (wsRes.data as any)?.content_source || null,
        })
    } catch (error: any) {
        console.error('intelligence GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
