import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const resolvedId = await resolveWorkspaceId(id)
        const { archetype } = await req.json()

        if (!archetype || !['product', 'service', 'hospitality', 'education', 'creator'].includes(archetype)) {
            return NextResponse.json({ error: 'Invalid archetype' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase
            .from('workspaces')
            .update({ business_archetype: archetype })
            .eq('id', resolvedId)

        if (error) throw error
        return NextResponse.json({ ok: true, archetype })
    } catch (error: any) {
        console.error('archetype PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
