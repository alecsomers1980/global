import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

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

        if (!workspaceParam) {
            return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
        }

        const workspaceId = await resolveWorkspaceId(workspaceParam)
        const supabase = admin()

        const { data, error } = await supabase
            .from('workspace_api_keys')
            .select('id, label, last_used_at, created_at, revoked_at')
            .eq('workspace_id', workspaceId)
            .is('revoked_at', null)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ keys: data || [] })
    } catch (error: any) {
        console.error('List API keys error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { keyId } = await req.json()
        if (!keyId) {
            return NextResponse.json({ error: 'keyId is required' }, { status: 400 })
        }

        const supabase = admin()
        const { error } = await supabase
            .from('workspace_api_keys')
            .delete()
            .eq('id', keyId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete API key error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
