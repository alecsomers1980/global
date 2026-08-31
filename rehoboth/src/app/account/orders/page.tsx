"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { rands } from "@/lib/money";
import { getMyOrders, type MyOrder } from "./actions";

export default function AccountOrdersPage() {
  const router = useRouter();
  const [state, setState] = useState<
    { phase: "loading" } | { phase: "error"; message: string } | { phase: "ready"; email: string; orders: MyOrder[] }
  >({ phase: "loading" });

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

        const result = await getMyOrders(session.access_token);
        setState(
          result.ok
            ? { phase: "ready", email: result.email, orders: result.orders }
            : { phase: "error", message: result.error }
        );
      } catch {
        setState({ phase: "error", message: "We could not load your account just now." });
      }
    })();
  }, [router]);

  async function signOut() {
    try {
      await getBrowserClient().auth.signOut();
      window.sessionStorage.removeItem("reh-session-only");
    } catch {
      // Signing out locally is the part that matters; a failed network call
      // must not strand someone on a page they are trying to leave.
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[820px] px-6 py-16 md:px-16 md:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl text-ink md:text-[52px]">Your orders</h1>
          {state.phase === "ready" && (
            <button
              type="button"
              onClick={signOut}
              className="min-h-[44px] text-[14px] text-ink-soft underline hover:text-brand"
            >
              Sign out
            </button>
          )}
        </div>

        {state.phase === "ready" && (
          <p className="mt-3 text-[15px] text-ink-mute">Signed in as {state.email}</p>
        )}

        {state.phase === "loading" && <p className="mt-10 text-ink-mute">Loading…</p>}

        {state.phase === "error" && (
          <p role="alert" className="mt-10 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
            {state.message}
          </p>
        )}

        {state.phase === "ready" && state.orders.length === 0 && (
          <div className="mt-10 flex flex-col items-start gap-6">
            <p className="text-[17px] leading-relaxed text-ink-soft">
              Nothing here yet. Orders show up once payment has cleared — if you
              have just paid, give it a minute.
            </p>
            <Link
              href="/shop"
              className="flex min-h-[52px] items-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
            >
              Shop the range
            </Link>
          </div>
        )}

        {state.phase === "ready" && state.orders.length > 0 && (
          <ul className="mt-10 flex flex-col gap-8">
            {state.orders.map((order) => (
              <li key={order.reference} className="border border-hairline p-6 md:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="font-display text-xl text-ink">{order.reference}</span>
                  <span className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
                    {new Date(order.created_at).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {order.status === "fulfilled" ? " · sent" : " · paid"}
                  </span>
                </div>

                <ul className="mt-5 flex flex-col gap-3">
                  {order.order_items.map((item, n) => (
                    <li key={n} className="flex justify-between gap-4 text-[15px]">
                      <span className="text-ink">
                        {item.product_name}
                        <span className="block text-[13px] text-ink-mute">
                          {item.size_label} &times; {item.qty}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-ink">
                        {rands(item.unit_price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex justify-between border-t border-hairline pt-4 text-[15px]">
                  <span className="text-ink-soft">
                    {order.collect_from_farm ? "Collection" : "Delivered"}
                  </span>
                  <span className="font-display text-xl text-ink">{rands(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
