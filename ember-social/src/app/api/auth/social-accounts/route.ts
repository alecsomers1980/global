import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const workspaceParam = searchParams.get('workspaceId')

    if (!workspaceParam) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const workspaceId = await resolveWorkspaceId(workspaceParam)

    try {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase
            .from('social_accounts')
            .select('id, platform, account_name, account_id, token_expires_at')
            .eq('workspace_id', workspaceId)

        if (error) throw error

        return NextResponse.json({ accounts: data || [] })
    } catch (error: any) {
        console.error('Fetch social accounts error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
