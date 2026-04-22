import { createServerSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, ArrowRight, Wifi, WifiOff } from 'lucide-react'

export default async function WorkspacesPage() {
    const supabase = await createServerSupabaseClient()

    const { data: workspaces } = await supabase
        .from('workspaces')
        .select(`
      id, name, slug, logo_url, created_at,
      social_accounts(platform),
      posts(id, status)
    `)
        .order('name')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-sm mt-1" style={{ color: '#5a5a7a' }}>
                        {workspaces?.length ?? 0} client workspace{(workspaces?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link href="/dashboard/workspaces/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {workspaces?.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(249,115,22,0.1)' }}>
                        <Plus className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Add your first client</h3>
                    <p className="text-sm mb-6" style={{ color: '#5a5a7a' }}>
                        Create a workspace for each client to manage their social media
                    </p>
                    <Link href="/dashboard/workspaces/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        <Plus className="w-4 h-4" />
                        Add First Client
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(workspaces as any[])?.map((ws) => {
                        const connectedPlatforms = (ws.social_accounts as any[])?.map(a => a.platform) ?? []
                        const pendingPosts = (ws.posts as any[])?.filter(p => p.status === 'pending_approval').length ?? 0
                        const scheduledPosts = (ws.posts as any[])?.filter(p => p.status === 'scheduled').length ?? 0

                        return (
                            <Link key={ws.id} href={`/dashboard/workspaces/${ws.slug || ws.id}`}
                                className="glass-card p-5 transition-all hover:scale-[1.01] hover:ember-glow group block">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                            style={{ background: `hsl(${(ws.name || '').charCodeAt(0) * 7 % 360}, 55%, 35%)` }}>
                                            {ws.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{ws.name}</h3>
                                            <p className="text-xs" style={{ color: '#4a4a6a' }}>{ws.slug}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Platform connection status */}
                                <div className="flex items-center gap-2 mb-4">
                                    {['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'].map(p => (
                                        <div key={p} className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold transition-opacity"
                                            style={{
                                                background: connectedPlatforms.includes(p) ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                                                color: connectedPlatforms.includes(p) ? '#f97316' : '#2a2a42',
                                                border: `1px solid ${connectedPlatforms.includes(p) ? 'rgba(249,115,22,0.2)' : '#1a1a27'}`
                                            }}>
                                            {p.slice(0, 2).toUpperCase()}
                                        </div>
                                    ))}
                                    {connectedPlatforms.length === 0 && (
                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: '#4a4a6a' }}>
                                            <WifiOff className="w-3 h-3" /> No platforms connected
                                        </span>
                                    )}
                                </div>

                                {/* Quick stats */}
                                <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #1a1a27' }}>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{scheduledPosts}</p>
                                        <p className="text-[10px]" style={{ color: '#3a3a5a' }}>Scheduled</p>
                                    </div>
                                    {pendingPosts > 0 && (
                                        <div className="text-center">
                                            <p className="text-lg font-bold" style={{ color: '#fbbf24' }}>{pendingPosts}</p>
                                            <p className="text-[10px]" style={{ color: '#3a3a5a' }}>Pending</p>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
