"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Settings,
    LogOut,
    User,
    CalendarDays,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "My Cases", href: "/portal/cases", icon: Briefcase },
    { name: "My Bookings", href: "/portal/appointments", icon: CalendarDays },
    { name: "Documents", href: "/portal/documents", icon: FileText },
    { name: "Profile", href: "/portal/profile", icon: User },
    { name: "Settings", href: "/portal/settings", icon: Settings },
];

interface PortalSidebarProps {
    user?: {
        full_name: string | null;
        email: string | null;
        role: string | null;
    };
}

export function PortalSidebar({ user }: PortalSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-brand-navy text-white flex-col hidden md:flex h-screen sticky top-0">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-serif font-bold text-brand-gold">RVR Inc.</h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Client Portal</p>
            </div>

            {/* User Info */}
            {user && (
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-sm">
                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user.email || ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                                        ? "bg-brand-gold text-brand-navy font-semibold"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <Globe className="w-4 h-4" />
                    Back to Website
                </Link>

                <Button
                    variant="outline"
                    className="w-full justify-start text-red-400 border-red-900/30 hover:bg-red-950/30 hover:text-red-300"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
