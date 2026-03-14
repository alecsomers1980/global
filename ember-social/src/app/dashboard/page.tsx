import { createServerSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Users, Calendar, Flame, TrendingUp, AlertTriangle, Plus, ArrowRight, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()

    const [{ data: workspaces }, { data: recentPosts }] = await Promise.all([
        supabase.from('workspaces').select('id, name, slug').order('name'),
        supabase.from('posts')
            .select('id, content, platforms, scheduled_at, status, workspace_id, workspaces(name)')
            .in('status', ['scheduled', 'pending_approval', 'failed'])
            .order('scheduled_at', { ascending: true })
            .limit(8),
    ])

    const stats = [
        { label: 'Total Clients', value: workspaces?.length ?? 0, icon: Users, color: '#818cf8' },
        { label: 'Scheduled Posts', value: recentPosts?.filter((p: any) => p.status === 'scheduled').length ?? 0, icon: Calendar, color: '#34d399' },
        { label: 'Awaiting Approval', value: recentPosts?.filter((p: any) => p.status === 'pending_approval').length ?? 0, icon: CheckCircle, color: '#fbbf24' },
        { label: 'Failed Posts', value: recentPosts?.filter((p: any) => p.status === 'failed').length ?? 0, icon: AlertTriangle, color: '#f87171' },
    ]

    const statusColors: Record<string, string> = {
        scheduled: '#60a5fa',
        pending_approval: '#fbbf24',
        approved: '#34d399',
        published: '#34d399',
        failed: '#f87171',
        draft: '#6b7280',
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Agency Overview</h1>
                    <p className="text-sm mt-1" style={{ color: '#5a5a7a' }}>
                        Manage all your clients' social media from one place
                    </p>
                </div>
                <Link href="/dashboard/workspaces/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <Plus className="w-4 h-4" />
                    New Client
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm" style={{ color: '#5a5a7a' }}>{label}</span>
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ background: `${color}15`, color }}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming posts */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-white">Upcoming & Pending</h2>
                        <Link href="/dashboard/calendar" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                            Full calendar <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentPosts?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Flame className="w-10 h-10 mb-3 text-orange-400/30" />
                            <p className="text-sm font-medium" style={{ color: '#5a5a7a' }}>No posts scheduled yet</p>
                            <p className="text-xs mt-1" style={{ color: '#3a3a5a' }}>Create your first post to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentPosts?.map((post: any) => (
                                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                                    style={{ border: '1px solid #1a1a27' }}>
                                    <div className="w-2 h-2 rounded-full shrink-0"
                                        style={{ background: statusColors[post.status] ?? '#6b7280' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{post.content.slice(0, 60)}...</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px]" style={{ color: '#4a4a6a' }}>
                                                {(post.workspaces as any)?.name}
                                            </span>
                                            <span style={{ color: '#2a2a42' }}>·</span>
                                            <span className="text-[11px]" style={{ color: '#4a4a6a' }}>
                                                {post.platforms.join(', ')}
                                            </span>
                                            {post.scheduled_at && (
                                                <>
                                                    <span style={{ color: '#2a2a42' }}>·</span>
                                                    <span className="text-[11px]" style={{ color: '#4a4a6a' }}>
                                                        {formatDateTime(post.scheduled_at)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="badge text-[11px] shrink-0"
                                        style={{
                                            background: `${statusColors[post.status] ?? '#6b7280'}15`,
                                            color: statusColors[post.status] ?? '#6b7280'
                                        }}>
                                        {post.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Client list */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-white">Clients</h2>
                        <Link href="/dashboard/workspaces" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                            All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {workspaces?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="w-8 h-8 mb-2 text-orange-400/30" />
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>No clients yet</p>
                            <Link href="/dashboard/workspaces/new"
                                className="mt-3 text-xs text-orange-400 hover:text-orange-300">
                                + Add first client
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {workspaces?.slice(0, 8).map((ws: any) => (
                                <Link key={ws.id} href={`/dashboard/workspaces/${ws.id}`}
                                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5 group">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        style={{ background: `hsl(${ws.name.charCodeAt(0) * 7 % 360}, 60%, 35%)` }}>
                                        {ws.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium flex-1 truncate" style={{ color: '#c0c0d8' }}>
                                        {ws.name}
                                    </span>
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Compose Post', href: '/dashboard/compose', description: 'Create and schedule', color: '#f97316' },
                    { label: 'View Calendar', href: '/dashboard/calendar', description: 'Monthly overview', color: '#818cf8' },
                    { label: 'Check Inbox', href: '/dashboard/inbox', description: 'Comments & DMs', color: '#34d399' },
                    { label: 'Analytics', href: '/dashboard/analytics', description: 'Performance reports', color: '#fbbf24' },
                ].map(({ label, href, description, color }) => (
                    <Link key={href} href={href}
                        className="glass-card p-4 transition-all hover:scale-[1.02] hover:shadow-lg group"
                        style={{ ['--hover-color' as string]: color } as React.CSSProperties}>
                        <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                            style={{ background: `${color}15` }}>
                            <TrendingUp className="w-4 h-4" style={{ color }} />
                        </div>
                        <p className="font-semibold text-sm text-white">{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#4a4a6a' }}>{description}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
