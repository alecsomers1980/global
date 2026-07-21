"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Favourites" },
  { href: "/account/details", label: "My details" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium block ${
              isActive ? "bg-forest text-paper" : "text-ink hover:bg-surface-2"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="mt-8 rounded-xl px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 text-left"
      >
        Sign out
      </button>
    </nav>
  );
}
