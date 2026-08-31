"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { AdminNav } from "@/components/admin/AdminNav";

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

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
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
        setEmail(session.user.email ?? "");
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
      <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
        <AdminNav email={email} />
        {/* min-w-0: without it a wide orders table stretches this column
            instead of scrolling inside it. */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-10 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </TokenContext.Provider>
  );
}
