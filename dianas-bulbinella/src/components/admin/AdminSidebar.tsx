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

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
      (href === "/admin" && pathname === "/admin") ||
      (href !== "/admin" && pathname.startsWith(href))
        ? "bg-white/15"
        : ""
    }`;

  return (
    <aside className="w-60 bg-forest text-paper min-h-screen p-5 flex flex-col shrink-0">
      <div className="text-lg font-semibold tracking-tight">
        Diana&apos;s
        <span className="ml-2 text-xs uppercase tracking-wider opacity-60">
          ADMIN
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        <Link href="/admin" className={linkClass("/admin")}>
          Dashboard
        </Link>
        <Link href="/admin/orders" className={linkClass("/admin/orders")}>
          Orders
        </Link>
        <Link href="/admin/customers" className={linkClass("/admin/customers")}>
          Customers
        </Link>
        <Link href="/admin/products" className={linkClass("/admin/products")}>
          Products
        </Link>
        <Link href="/admin/specials" className={linkClass("/admin/specials")}>
          Specials
        </Link>
        <Link href="/admin/reviews" className={linkClass("/admin/reviews")}>
          Reviews
        </Link>
        <Link href="/admin/blog" className={linkClass("/admin/blog")}>
          Journal
        </Link>
        <Link href="/admin/dealers" className={linkClass("/admin/dealers")}>
          Dealers
        </Link>
        <Link href="/admin/popup" className={linkClass("/admin/popup")}>
          Popup
        </Link>
        <Link href="/admin/security" className={linkClass("/admin/security")}>
          Security
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/20">
        {email && <p className="text-xs text-paper/60 mb-3 truncate">{email}</p>}
        <button
          onClick={handleSignOut}
          className="text-xs text-paper/80 hover:text-paper underline-offset-2 hover:underline w-full text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
