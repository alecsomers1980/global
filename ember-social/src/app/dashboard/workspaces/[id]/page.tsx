import { createServerSupabaseClient } from '@/lib/supabase/client'
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Brain, Wifi, WifiOff, PenLine, Calendar,
    Inbox, BarChart2, Key, AlertTriangle, Palette, ShieldCheck, Newspaper
} from 'lucide-react'
import { PLATFORM_LABELS, PLATFORM_COLORS, formatDate } from '@/lib/utils'
import { isUuid } from '@/lib/resolve-workspace'

interface Props {
    params: Promise<{ id: string }>
}

export default async function WorkspacePage({ params }: Props) {
    const { id: param } = await params
    const supabase = await createServerSupabaseClient()

    // Resolve slug-or-uuid to workspace
    const lookupColumn = isUuid(param) ? 'id' : 'slug'
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq(lookupColumn, param)
        .single()

    const workspaceAny = workspace as any
    if (!workspaceAny) notFound()

    const id = workspaceAny.id // real UUID for subsequent queries
    const slug = workspaceAny.slug || id // used for outgoing links

    const [{ data: intel }, { data: socialAccounts }, { data: recentPosts }] = await Promise.all([
        supabase.from('client_intelligence').select('*').eq('workspace_id', id).single(),
        supabase.from('social_accounts').select('platform, account_name').eq('workspace_id', id),
        supabase.from('posts')
            .select('id, content, platforms, scheduled_at, status')
            .eq('workspace_id', id)
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    const { count: pendingCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', id)
        .eq('status', 'pending_approval')

    const intelAny = intel as any
    const recentPostsAny = recentPosts as any[]
    const socialAccountsAny = socialAccounts as any[]

    const connectedPlatforms = socialAccountsAny?.map((a: any) => a.platform) ?? []

    const tabs = [
        { label: 'Compose', href: `/dashboard/workspaces/${slug}/compose`, icon: PenLine },
        { label: 'Approvals', href: `/dashboard/workspaces/${slug}/approvals`, icon: ShieldCheck, badge: pendingCount },
        { label: 'Calendar', href: `/dashboard/workspaces/${slug}/calendar`, icon: Calendar },
        { label: 'Inbox', href: `/dashboard/workspaces/${slug}/inbox`, icon: Inbox },
        { label: 'Analytics', href: `/dashboard/workspaces/${slug}/analytics`, icon: BarChart2 },
        { label: 'Intelligence', href: `/dashboard/workspaces/${slug}/intelligence`, icon: Brain },
        { label: 'Brand Kit', href: `/dashboard/workspaces/${slug}/brand-kit`, icon: Palette },
        { label: 'News', href: `/dashboard/workspaces/${slug}/news`, icon: Newspaper },
        { label: 'Platforms', href: `/dashboard/workspaces/${slug}/platforms`, icon: Wifi },
        { label: 'API Keys', href: `/dashboard/workspaces/${slug}/api-keys`, icon: Key },
    ]

    const statusColors: Record<string, string> = {
        scheduled: '#60a5fa', pending_approval: '#fbbf24',
        published: '#34d399', failed: '#f87171', draft: '#6b7280',
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/workspaces"
                    className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-white"
                    style={{ color: '#5a5a7a' }}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    All clients
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                        style={{ background: `hsl(${workspaceAny.name.charCodeAt(0) * 7 % 360}, 55%, 35%)` }}>
                        {workspaceAny.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{workspaceAny.name}</h1>
                        <p className="text-sm" style={{ color: '#5a5a7a' }}>
                            Created {formatDate(workspaceAny.created_at)} · {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? 's' : ''} connected
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick action tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(({ label, href, icon: Icon, badge }: any) => (
                    <Link key={href} href={href}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                        style={{ background: '#1a1a27', color: '#8a8aaa', border: '1px solid #2a2a3d' }}>
                        <Icon className="w-4 h-4" />
                        {label}
                        {badge > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                                {badge}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* Platform status */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-orange-400" />
                        Platform Connections
                    </h2>
                    <div className="space-y-2">
                        {(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'] as const).map(p => {
                            const connected = connectedPlatforms.includes(p)
                            const account = socialAccountsAny?.find(a => a.platform === p)
                            return (
                                <div key={p} className="flex items-center justify-between p-2.5 rounded-lg"
                                    style={{ background: connected ? 'rgba(249,115,22,0.06)' : '#13131a', border: `1px solid ${connected ? 'rgba(249,115,22,0.15)' : '#1a1a27'}` }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full"
                                            style={{ background: connected ? PLATFORM_COLORS[p] : '#2a2a42' }} />
                                        <span className="text-sm font-medium" style={{ color: connected ? '#e0e0f0' : '#4a4a6a' }}>
                                            {PLATFORM_LABELS[p]}
                                        </span>
                                    </div>
                                    {connected ? (
                                        <span className="text-[11px]" style={{ color: '#5a5a7a' }}>{account?.account_name}</span>
                                    ) : (
                                        <Link href={`/dashboard/workspaces/${slug}/platforms`}
                                            className="text-[11px] text-orange-400 hover:text-orange-300">Connect</Link>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Client Intelligence preview */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Brain className="w-4 h-4 text-orange-400" />
                            Client Intelligence
                        </h2>
                        <Link href={`/dashboard/workspaces/${slug}/intelligence`}
                            className="text-xs text-orange-400 hover:text-orange-300">Edit</Link>
                    </div>

                    {!intelAny?.industry ? (
                        <div className="text-center py-6">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400/50" />
                            <p className="text-sm font-medium" style={{ color: '#5a5a7a' }}>Intelligence not set up</p>
                            <p className="text-xs mt-1 mb-3" style={{ color: '#3a3a5a' }}>
                                Complete the questionnaire so AI can write in their voice
                            </p>
                            <Link href={`/dashboard/workspaces/${slug}/intelligence`}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                                style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}>
                                Set Up Now
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { label: 'Industry', value: intelAny.industry },
                                { label: 'Audience', value: intelAny.target_audience },
                                { label: 'Voice', value: intelAny.brand_voice },
                                { label: 'This Month', value: intelAny.current_month_focus },
                            ].filter(i => i.value).map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#3a3a5a' }}>{label}</p>
                                    <p className="text-sm" style={{ color: '#9090b0' }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent posts */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-orange-400" />
                            Recent Posts
                        </h2>
                        <Link href={`/dashboard/workspaces/${slug}/compose`}
                            className="text-xs text-orange-400 hover:text-orange-300">+ New</Link>
                    </div>

                    {recentPostsAny?.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>No posts yet</p>
                            <Link href={`/dashboard/workspaces/${slug}/compose`}
                                className="text-xs text-orange-400 hover:text-orange-300 mt-1 inline-block">
                                Create first post →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentPostsAny?.map((post: any) => (
                                <div key={post.id} className="p-2.5 rounded-lg" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                                    <p className="text-xs text-white truncate mb-1">{post.content.slice(0, 55)}...</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: statusColors[post.status] ?? '#6b7280' }} />
                                        <span className="text-[10px]" style={{ color: '#3a3a5a' }}>
                                            {post.status.replace('_', ' ')}
                                        </span>
                                        {post.scheduled_at && (
                                            <span className="text-[10px]" style={{ color: '#3a3a5a' }}>
                                                · {formatDate(post.scheduled_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
