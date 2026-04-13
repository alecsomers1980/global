import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, BarChart3, Settings, Building2, CreditCard } from 'lucide-react'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pb = await createClient()
    const user = pb.authStore.model

    if (!user) {
        redirect('/login')
    }

    // Check if user is a business owner
    let business: any = null
    try {
        business = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`, {
            select: 'id,name'
        })
    } catch (e) {
        // Not a business owner, redirect
        redirect('/')
    }

    return (
        <div className="min-h-screen pt-24 bg-muted/20 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-card border-r shadow-xl flex flex-col">
                <div className="p-8 border-b border-primary/5">
                    <Link href="/portal" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-black text-lg text-primary leading-tight tracking-tight">Client Portal</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">{business.name}</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="mb-6">
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 px-4">Menu</p>
                        <NavLink href="/portal" icon={BarChart3}>Analytics Dashboard</NavLink>
                        <NavLink href={`/business/${business.id}`} icon={Building2} external>View Live Profile</NavLink>
                        <NavLink href="/portal/billing" icon={CreditCard}>Billing & Subscription</NavLink>
                        <NavLink href="/portal/settings" icon={Settings}>Profile Settings</NavLink>
                    </div>
                </nav>

                <div className="p-6 border-t border-primary/5 bg-primary/5">
                    <form action="/login" method="GET">
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-8 lg:p-12 max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon: Icon, children, external }: { href: string; icon: any; children: React.ReactNode; external?: boolean }) {
    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-primary/5"
            >
                <Icon className="h-4 w-4 text-primary/60" />
                {children}
            </a>
        )
    }

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
