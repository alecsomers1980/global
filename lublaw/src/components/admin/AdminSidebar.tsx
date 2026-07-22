"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/blog", label: "Blog" },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-surface min-h-screen p-4">
      <p className="text-xs text-muted mb-4 truncate">{email}</p>
      <nav className="space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded-lg text-sm ${
              pathname === l.href ? "bg-maroon text-white" : "text-ink hover:bg-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleSignOut}
        className="mt-6 text-sm text-muted hover:text-maroon"
      >
        Sign out
      </button>
    </aside>
  );
}
