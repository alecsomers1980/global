import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { generateCampaign } from '@/lib/ai/campaignGenerator'

export async function POST(req: Request) {
    try {
        const { workspaceId, durationDays } = await req.json()
        if (!workspaceId) return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })

        const resolvedId = await resolveWorkspaceId(workspaceId)
        const supabase = await createServerSupabaseClient()

        const [{ data: intel }, { data: socialAccounts }] = await Promise.all([
            supabase.from('client_intelligence').select('*').eq('workspace_id', resolvedId).single(),
            supabase.from('social_accounts').select('platform').eq('workspace_id', resolvedId)
        ])

        const connectedPlatforms = (socialAccounts || []).map((a: any) => a.platform)

        const result = await generateCampaign({
            workspaceId: resolvedId,
            durationDays: durationDays || 30,
            connectedPlatforms,
            intel
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Campaign generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
