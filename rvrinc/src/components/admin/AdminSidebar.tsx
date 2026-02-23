"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Users,
    Settings,
    LogOut,
    Shield,
    ShieldCheck,
    CalendarDays,
    Globe,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Case Manager", href: "/admin/cases", icon: Briefcase },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { name: "Documents", href: "/admin/documents", icon: FileText },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "User Management", href: "/admin/users", icon: ShieldCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
    user?: {
        full_name: string | null;
        email: string | null;
        role: string | null;
    };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex h-screen sticky top-0 border-r border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="bg-brand-gold p-1.5 rounded">
                    <Shield className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">RVR Admin</h1>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Staff Portal</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-brand-gold text-slate-900 font-semibold"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                {user && (
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-sm font-medium text-white truncate">{user.full_name || 'Admin User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 inline-block px-2 py-0.5 rounded border border-brand-gold/20">
                            {user.role}
                        </div>
                    </div>
                )}

                <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                    <Globe className="w-4 h-4" />
                    Back to Website
                </Link>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-950/30 hover:text-red-300"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
