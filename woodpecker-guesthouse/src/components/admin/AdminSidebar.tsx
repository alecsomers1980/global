"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/security", label: "Security" },
];

export default function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-paper min-h-screen p-6 flex flex-col">
      <p className="font-display text-lg text-ink mb-1">Woodpecker</p>
      <p className="text-xs text-muted mb-8 truncate">{email}</p>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === item.href ? "bg-terracotta text-white" : "text-ink hover:bg-surface"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="text-sm text-muted hover:text-terracotta text-left px-3 py-2"
      >
        Sign out
      </button>
    </aside>
  );
}