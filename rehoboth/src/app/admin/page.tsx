"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminToken } from "./AdminGate";
import { getDashboard, type DashboardSummary } from "./actions";
import { rands } from "@/lib/money";
import {
  BTN_SECONDARY,
  Card,
  EmptyState,
  Notice,
  PageHeader,
  StatCard,
  StatusPill,
} from "@/components/admin/ui";

export default function AdminDashboard() {
  const token = useAdminToken();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getDashboard(token).then((r) => (r.ok ? setSummary(r.data) : setError(r.error)));
  }, [token]);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="What is waiting for you, and the last few orders through the shop."
        action={
          <Link href="/" className={BTN_SECONDARY}>
            View shop
          </Link>
        }
      />

      {error && (
        <div className="mt-8">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {!summary ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Paid, to send"
              value={summary.toSend}
              href="/admin/orders"
              note={summary.toSend > 0 ? "Ready to pack" : undefined}
            />
            <StatCard
              label="Messages to answer"
              value={summary.messagesToAnswer}
              href="/admin/messages"
            />
            <StatCard
              label="New stockists"
              value={summary.newStockists}
              href="/admin/stockists"
            />
            <StatCard
              label="Products on the site"
              value={summary.productsLive}
              href="/admin/products"
              note={
                // Baskets that never reached PayFast. Worth seeing, but not
                // worth a tile of its own — nobody acts on an abandoned basket.
                summary.awaitingPayment > 0
                  ? `${summary.awaitingPayment} basket${summary.awaitingPayment === 1 ? "" : "s"} unpaid`
                  : undefined
              }
            />
          </div>

          <div className="mt-5">
            <Card
              title="Recent orders"
              description="The last five orders started through the shop, paid or not."
            >
              {summary.recent.length === 0 ? (
                <EmptyState message="No orders yet." />
              ) : (
                <ul className="divide-y divide-hairline">
                  {summary.recent.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-7 py-5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] text-ink">
                          {o.customer_name}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-mute">
                          {o.reference} · {String(o.created_at).slice(0, 10)}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-[15px] text-ink">
                        {rands(Number(o.total))}
                      </span>
                      <StatusPill status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-hairline px-7 py-5">
                <Link
                  href="/admin/orders"
                  className="text-[11px] uppercase tracking-[0.18em] text-brand hover:underline"
                >
                  All orders →
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
