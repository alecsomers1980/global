"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Newspaper,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Enquiries",
    href: "/admin/enquiries",
    icon: FileText,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: Building2,
  },
  {
    name: "Articles",
    href: "/admin/articles",
    icon: Newspaper,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 p-4">
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                : "text-brand-navy/60 hover:bg-gray-100 hover:text-brand-navy"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.name}
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Link>
        );
      })}

      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
          <Image
            src="/images/logos/Exec-Air_Logo_2023.png"
            alt="Exec-Air"
            width={140}
            height={42}
            className="h-11 w-auto"
            priority
          />
          <span className="font-bold text-brand-navy">Admin</span>
        </div>
        {sidebar}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logos/Exec-Air_Logo_2023.png"
                  alt="Exec-Air"
                  width={140}
                  height={42}
                  className="h-11 w-auto"
                />
                <span className="font-bold text-brand-navy">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/90 px-6 backdrop-blur-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-brand-navy/60">Admin Panel</span>
          <Link
            href="/"
            target="_blank"
            className="ml-auto rounded-full bg-brand-sky/30 px-4 py-1.5 text-xs font-medium text-brand-teal transition-colors hover:bg-brand-sky/50"
          >
            View Site
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
