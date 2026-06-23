import { requireAdmin } from '@/utils/pocketbase/admin'
import Link from 'next/link'
import { LayoutDashboard, Users, UserCog, Briefcase, Calendar, DollarSign, FileText, Settings, LogOut, Star, Inbox } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="min-h-screen pt-24 bg-muted/20 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-card border-r shadow-xl flex flex-col">
                <div className="p-8 border-b border-primary/5">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                            DB
                        </div>
                        <div>
                            <h2 className="font-black text-lg text-primary leading-tight tracking-tight">Admin Portal</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Directory Mgmt</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="mb-6">
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 px-4">Overview</p>
                        <NavLink href="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 px-4">Core Directory</p>
                        <NavLink href="/admin/businesses" icon={Briefcase}>Businesses</NavLink>
                        <NavLink href="/admin/enquiries" icon={Inbox}>Enquiries</NavLink>
                        <NavLink href="/admin/subscriptions" icon={FileText}>Subscriptions</NavLink>
                        <NavLink href="/admin/spotlight" icon={FileText}>Spotlight Articles</NavLink>
                        <NavLink href="/admin/reviews" icon={Star}>Reviews</NavLink>
                        <NavLink href="/admin/revenue" icon={DollarSign}>Revenue</NavLink>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 px-4">Content Mgmt</p>
                        <NavLink href="/admin/events" icon={Calendar}>Events</NavLink>
                        <NavLink href="/admin/jobs" icon={Users}>Jobs Hub</NavLink>
                        <NavLink href="/admin/opportunities" icon={Briefcase}>Opportunities</NavLink>
                        <NavLink href="/admin/editor-spotlight" icon={Users}>Editor Spotlight</NavLink>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 px-4">System</p>
                        <NavLink href="/admin/users" icon={UserCog}>User Management</NavLink>
                        <NavLink href="/admin/settings" icon={Settings}>Settings</NavLink>
                    </div>
                </nav>

                <div className="p-6 border-t border-primary/5 bg-primary/5">
                    <form action="/auth/signout" method="POST">
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-8 lg:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-primary/5"
        >
            <Icon className="h-4 w-4 text-primary/60" />
            {children}
        </Link>
    )
}
