'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, LayoutDashboard, Users, Calendar, Inbox, BarChart2, Settings, Plus, ChevronRight, Brain, PenLine, Wifi, Key, Palette, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Workspace {
    id: string
    name: string
    slug: string
    logo_url: string | null
}

interface SidebarProps {
    workspaces: Workspace[]
}

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/dashboard/workspaces', icon: Users },
]

export function Sidebar({ workspaces }: SidebarProps) {
    const pathname = usePathname()

    // Extract workspace ID from pathname if active
    const workspaceIdMatch = pathname.match(/\/dashboard\/workspaces\/([a-zA-Z0-9-]+)/)
    const activeWorkspaceId = workspaceIdMatch ? workspaceIdMatch[1] : null
    const isInsideWorkspace = activeWorkspaceId && activeWorkspaceId !== 'new'

    const workspaceNavItems = isInsideWorkspace ? [
        { label: 'Intelligence', href: `/dashboard/workspaces/${activeWorkspaceId}/intelligence`, icon: Brain },
        { label: 'Brand Kit', href: `/dashboard/workspaces/${activeWorkspaceId}/brand-kit`, icon: Palette },
        { label: 'Compose', href: `/dashboard/workspaces/${activeWorkspaceId}/compose`, icon: PenLine },
        { label: 'Approvals', href: `/dashboard/workspaces/${activeWorkspaceId}/approvals`, icon: ShieldCheck },
        { label: 'Calendar', href: `/dashboard/workspaces/${activeWorkspaceId}/calendar`, icon: Calendar },
        { label: 'Inbox', href: `/dashboard/workspaces/${activeWorkspaceId}/inbox`, icon: Inbox },
        { label: 'Analytics', href: `/dashboard/workspaces/${activeWorkspaceId}/analytics`, icon: BarChart2 },
        { label: 'Platforms', href: `/dashboard/workspaces/${activeWorkspaceId}/platforms`, icon: Wifi },
        { label: 'API Keys', href: `/dashboard/workspaces/${activeWorkspaceId}/api-keys`, icon: Key },
    ] : []

    return (
        <aside className="flex flex-col h-full shrink-0 overflow-y-auto"
            style={{ width: 'var(--sidebar-width)', background: '#0d0d14', borderRight: '1px solid #1a1a27' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl ember-glow"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-white text-sm leading-none">Ember Social</p>
                    <p className="text-[10px] leading-none mt-0.5" style={{ color: '#4a4a6a' }}>Automations</p>
                </div>
            </div>

            {/* Main nav */}
            <nav className="px-3 mt-2 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = href === '/dashboard' ? pathname === href : (pathname === href || (href === '/dashboard/workspaces' && pathname.startsWith(href) && !isInsideWorkspace))
                    return (
                        <Link key={href} href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                                active
                                    ? 'text-white'
                                    : 'text-[#5a5a7a] hover:text-white hover:bg-white/5'
                            )}
                            style={active ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c' } : {}}>
                            <Icon className={cn('w-4 h-4', active ? 'text-orange-400' : 'text-[#3a3a5a] group-hover:text-[#7a7a9a]')} />
                            {label}
                            {active && <ChevronRight className="w-3 h-3 ml-auto text-orange-400/50" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Workspace Nav (Dynamic) */}
            {isInsideWorkspace && (
                <div className="mt-6 px-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 block" style={{ color: '#3a3a5a' }}>
                        Workspace
                    </span>
                    <nav className="space-y-0.5">
                        {workspaceNavItems.map(({ label, href, icon: Icon }) => {
                            const active = pathname === href
                            return (
                                <Link key={href} href={href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                                        active
                                            ? 'text-white'
                                            : 'text-[#5a5a7a] hover:text-white hover:bg-white/5'
                                    )}
                                    style={active ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c' } : {}}>
                                    <Icon className={cn('w-4 h-4', active ? 'text-orange-400' : 'text-[#3a3a5a] group-hover:text-[#7a7a9a]')} />
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            )}

            {/* Clients section */}
            <div className="mt-6 px-3">
                <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#3a3a5a' }}>
                        Clients
                    </span>
                    <Link href="/dashboard/workspaces/new"
                        className="flex items-center justify-center w-5 h-5 rounded-md transition-colors hover:bg-orange-500/20"
                        title="Add client">
                        <Plus className="w-3 h-3 text-orange-400" />
                    </Link>
                </div>

                <div className="space-y-0.5">
                    {workspaces.length === 0 && (
                        <p className="px-3 py-2 text-xs" style={{ color: '#3a3a5a' }}>No clients yet</p>
                    )}
                    {workspaces.map((ws) => {
                        const identifier = ws.slug || ws.id
                        const active = pathname.startsWith(`/dashboard/workspaces/${identifier}`) || pathname.startsWith(`/dashboard/workspaces/${ws.id}`)
                        return (
                            <Link key={ws.id} href={`/dashboard/workspaces/${identifier}`}
                                className={cn(
                                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                                    active ? 'text-white' : 'text-[#5a5a7a] hover:text-white hover:bg-white/5'
                                )}
                                style={active ? { background: 'rgba(249,115,22,0.1)', color: '#fba96c' } : {}}>
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ background: `hsl(${ws.name.charCodeAt(0) * 7 % 360}, 60%, 40%)` }}>
                                    {ws.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{ws.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="mt-auto px-5 py-4">
                <div className="text-[10px]" style={{ color: '#2a2a42' }}>
                    Ember Social v1.0
                </div>
            </div>
        </aside>
    )
}
