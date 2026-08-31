"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

/**
 * Navigation guard for the admin.
 *
 * This is a convenience, not a security boundary — it decides what a browser
 * renders, and a browser is not to be trusted. Every admin action re-verifies
 * the token server-side in lib/admin.ts. The token is handed to children so
 * they can pass it to those actions.
 */
const TokenContext = createContext<string>("");
export const useAdminToken = () => useContext(TokenContext);

const NAV = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stockists", label: "Stockists" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { session },
        } = await getBrowserClient().auth.getSession();
        if (!session) {
          router.replace("/account/login");
          return;
        }
        // Reading the role here only decides what to draw; the server checks it
        // again on every action.
        const role = (session.user.app_metadata as { role?: string } | null)?.role;
        if (role !== "admin") {
          setRefused(true);
          return;
        }
        setToken(session.access_token);
      } catch {
        setRefused(true);
      }
    })();
  }, [router]);

  if (refused) {
    return (
      <main className="mx-auto max-w-[520px] px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Not your door</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          This area is for Rehoboth staff. If you think you should have access,
          ask Frieda to add you.
        </p>
        <Link href="/" className="mt-8 inline-block text-[14px] text-ink-soft underline hover:text-brand">
          Back to the shop
        </Link>
      </main>
    );
  }

  if (!token) {
    return <p className="px-6 py-24 text-center text-ink-mute">Checking your access…</p>;
  }

  return (
    <TokenContext.Provider value={token}>
      <div className="min-h-screen bg-ground">
        <header className="border-b border-hairline bg-white">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
            <Link href="/admin/orders" className="font-display text-lg text-ink">
              Rehoboth admin
            </Link>
            <nav className="flex flex-wrap gap-6 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname.startsWith(item.href)
                      ? "text-brand"
                      : "text-ink-soft hover:text-brand"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/" className="ml-auto text-[13px] text-ink-mute hover:text-brand">
              View site
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-6 py-10">{children}</main>
      </div>
    </TokenContext.Provider>
  );
}
