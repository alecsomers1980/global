import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Package } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Note: For a robust admin, you'd check `user.user_metadata.role === 'admin'` or via RLS
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-muted/40 md:grid md:grid-cols-[250px_1fr]">
            {/* Sidebar Navigation */}
            <aside className="hidden border-r bg-background md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package className="h-6 w-6 text-primary" />
                            <span className="">DBIB Portal</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary bg-muted transition-all hover:text-primary"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard / Leads
                            </Link>
                            <Link
                                href="/admin/businesses"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Users className="h-4 w-4" />
                                Directory Approvals
                            </Link>
                            <Link
                                href="/admin/content"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <FileText className="h-4 w-4" />
                                Manage Content
                            </Link>
                            <hr className="my-2" />
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 flex flex-col gap-2 border-t">
                        <div className="text-xs text-muted-foreground pb-2 px-2 truncate">
                            Logged in as {user.email}
                        </div>
                        {/* Note: Real app should use a form action to sign out */}
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive w-full hover:bg-destructive/10">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col p-4 lg:p-6">
                {children}
            </main>
        </div>
    )
}
