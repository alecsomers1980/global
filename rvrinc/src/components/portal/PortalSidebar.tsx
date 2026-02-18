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
    User
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "My Cases", href: "/portal/cases", icon: Briefcase },
    { name: "Documents", href: "/portal/documents", icon: FileText },
    { name: "Profile", href: "/portal/profile", icon: User },
    { name: "Settings", href: "/portal/settings", icon: Settings },
];

export function PortalSidebar() {
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

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
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

            <div className="p-4 border-t border-white/10">
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
