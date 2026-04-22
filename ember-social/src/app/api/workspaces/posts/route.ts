import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const { searchParams } = new URL(req.url)
        const workspaceParam = searchParams.get('workspaceId')
        const statuses = searchParams.get('statuses') // comma-separated

        if (!workspaceParam) {
            return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
        }

        const workspaceId = await resolveWorkspaceId(workspaceParam)

        const statusList = statuses
            ? statuses.split(',').map(s => s.trim())
            : ['pending_approval', 'draft', 'approved']

        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, content, media_urls, platforms, scheduled_at, status, approval_token, created_at')
            .eq('workspace_id', workspaceId)
            .in('status', statusList)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Also fetch brand kit
        const { data: brandKit } = await supabase
            .from('brand_kits')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single()

        return NextResponse.json({ posts: posts || [], brandKit: brandKit || null })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
