import { createAdminClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { PlanView } from './ClientView'

export default async function PlanPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = createAdminClient()

    const { data: batch } = await supabase
        .from('campaign_batches')
        .select('*, workspaces(name)')
        .eq('public_token', token)
        .single()

    if (!batch) notFound()

    const workspaceName = (batch as any).workspaces?.name || 'Ember Social'

    const [{ data: posts }, { data: brandKit }] = await Promise.all([
        supabase
            .from('posts')
            .select('*')
            .eq('campaign_batch_id', batch.id)
            .order('scheduled_at', { ascending: true }),
        supabase
            .from('brand_kits')
            .select('logo_url, primary_color, accent_color')
            .eq('workspace_id', batch.workspace_id)
            .maybeSingle()
    ])

    if (!posts || posts.length === 0) notFound()

    const primaryColor = (brandKit as any)?.primary_color || '#FFE600'
    const logoUrl = (brandKit as any)?.logo_url || null

    const dates = posts.map(p => new Date(p.scheduled_at!)).filter(d => !isNaN(d.getTime()))
    const dateRange = (() => {
        if (dates.length === 0) return ''
        const fmt = (d: Date) => d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
        return `${fmt(dates[0])} - ${fmt(dates[dates.length - 1])}`
    })()

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#e2e2f0]" style={{ fontFamily: 'var(--font-sans)' }}>
            {/* Header */}
            <header className="sticky top-0 z-10 glass-card rounded-none px-6 py-4"
                style={{ borderBottom: '1px solid #1a1a27', background: 'rgba(10,10,15,0.8)' }}>
                <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        {logoUrl && <img src={logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                        <div>
                            <p className="font-bold text-white text-sm leading-none">{workspaceName}</p>
                            <p className="text-[10px] leading-none mt-1" style={{ color: '#5a5a7a' }}>30-day plan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs" style={{ color: '#5a5a7a' }}>{dateRange}</span>
                        <a href={`/api/workspaces/campaign/pdf?token=${token}`}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                            style={{ background: primaryColor, color: '#0a0a0f' }}>
                            Download PDF
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 space-y-8 pb-32">
                {/* Strategy rationale */}
                {batch.strategy_rationale && (
                    <div className="glass-card p-5">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#5a5a7a' }}>Strategy</h2>
                        <p className="text-sm leading-relaxed" style={{ color: '#b0b0c0' }}>{batch.strategy_rationale}</p>
                    </div>
                )}

                <PlanView posts={posts || []} token={token} primaryColor={primaryColor} dateRange={dateRange} />
            </main>
        </div>
    )
}
