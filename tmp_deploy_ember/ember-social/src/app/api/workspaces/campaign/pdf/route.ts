import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { renderToStream } from '@react-pdf/renderer'
import { SchedulePdf } from '@/lib/pdf/SchedulePdf'

export async function GET(req: Request) {
    try {
        const token = new URL(req.url).searchParams.get('token')
        if (!token) {
            return NextResponse.json({ error: 'token required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { data: batch } = await supabase
            .from('campaign_batches')
            .select('*, workspaces(name, slug)')
            .eq('public_token', token)
            .single()

        if (!batch) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const [{ data: posts }, { data: brandKit }] = await Promise.all([
            supabase
                .from('posts')
                .select('*')
                .eq('campaign_batch_id', batch.id)
                .order('scheduled_at', { ascending: true }),
            supabase
                .from('brand_kits')
                .select('*')
                .eq('workspace_id', batch.workspace_id)
                .maybeSingle()
        ])

        if (!posts || posts.length === 0) {
            return NextResponse.json({ error: 'No posts in batch' }, { status: 404 })
        }

        const workspaceName = (batch as any).workspaces?.name || 'Ember Social'
        const workspaceSlug = (batch as any).workspaces?.slug || 'plan'
        const yearMonth = new Date().toISOString().slice(0, 7)

        const stream = await renderToStream(
            SchedulePdf({
                batch,
                posts,
                brandKit: brandKit || {},
                workspaceName,
            })
        )

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="schedule-${workspaceSlug}-${yearMonth}.pdf"`,
            },
        })
    } catch (error: any) {
        console.error('PDF generation error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'PDF generation failed' }, { status: 500 })
    }
}
