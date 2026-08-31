"use client";

import { Fragment, useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { rands } from "@/lib/money";
import { listOrders, markFulfilled, type AdminOrder } from "../actions";
import {
  BTN_QUIET,
  BTN_SECONDARY,
  Card,
  EmptyState,
  FilterChips,
  Notice,
  PageHeader,
  StatusPill,
} from "@/components/admin/ui";

const FILTERS = [
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All" },
];

const TH =
  "border-b border-hairline px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink-mute";
const TD = "border-b border-hairline px-4 py-4 align-top text-ink";

const date = (d: string) =>
  new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

export default function AdminOrdersPage() {
  const token = useAdminToken();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("paid");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await listOrders(token, filter === "all" ? undefined : filter);
      if (cancelled) return;
      if (result.ok) setOrders(result.data);
      else setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, filter]);

  async function markSent(id: string) {
    if (!token || busyId) return;
    setBusyId(id);
    setError(null);
    const result = await markFulfilled(token, id);
    if (result.ok) {
      const reload = await listOrders(token, filter === "all" ? undefined : filter);
      if (reload.ok) setOrders(reload.data);
    } else {
      setError(result.error);
    }
    setBusyId(null);
  }

  function downloadCsv() {
    const cell = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [
      ["Reference", "Date", "Name", "Email", "Phone", "Delivery", "Address", "Subtotal", "Shipping", "Total", "Status"],
      ...orders.map((o) => [
        o.reference,
        date(o.created_at),
        o.customer_name,
        o.customer_email,
        o.customer_phone ?? "",
        o.collect_from_farm ? "Collect from farm" : "Delivery",
        o.collect_from_farm
          ? ""
          : [o.ship_line1, o.ship_city, o.ship_province, o.ship_postcode].filter(Boolean).join(", "),
        Number(o.subtotal).toFixed(2),
        Number(o.shipping).toFixed(2),
        Number(o.total).toFixed(2),
        o.status,
      ]),
    ];
    const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
    // BOM, so Excel opens the rand amounts and any accented name as UTF-8.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rehoboth-orders-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        eyebrow="Selling"
        title="Orders"
        description="Everything started through the checkout. Only an order PayFast has confirmed as paid can be marked sent."
        action={
          <button type="button" onClick={downloadCsv} disabled={orders.length === 0} className={BTN_SECONDARY}>
            Download CSV
          </button>
        }
      />

      <div className="mt-8">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : orders.length === 0 ? (
        <Card className="mt-6">
          <EmptyState message="No orders here yet." />
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <thead>
              <tr>
                <th className={TH}>Reference</th>
                <th className={TH}>Date</th>
                <th className={TH}>Customer</th>
                <th className={TH}>Delivery</th>
                <th className={TH}>Total</th>
                <th className={TH}>Status</th>
                <th className={TH} />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td className={TD}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                        aria-expanded={expandedId === o.id}
                        className="text-brand underline"
                      >
                        {o.reference}
                      </button>
                    </td>
                    <td className={TD}>{date(o.created_at)}</td>
                    <td className={TD}>{o.customer_name}</td>
                    <td className={TD}>{o.collect_from_farm ? "Collect" : (o.ship_city ?? "")}</td>
                    <td className={TD}>{rands(Number(o.total))}</td>
                    <td className={TD}>
                      <StatusPill status={o.status === "fulfilled" ? "sent" : o.status} />
                    </td>
                    <td className={TD}>
                      {o.status === "paid" && (
                        <button
                          type="button"
                          onClick={() => markSent(o.id)}
                          disabled={busyId === o.id}
                          className={BTN_QUIET}
                        >
                          Mark sent
                        </button>
                      )}
                    </td>
                  </tr>

                  {expandedId === o.id && (
                    <tr>
                      <td colSpan={7} className="border-b border-hairline bg-brand-wash/50 px-4 py-5 align-top text-ink">
                        <p className="text-[15px]">
                          {o.collect_from_farm
                            ? "Collecting from the farm"
                            : [o.ship_line1, o.ship_city, o.ship_province, o.ship_postcode].filter(Boolean).join(", ")}
                        </p>
                        <p className="mt-1 text-[13px] text-ink-mute">
                          {o.customer_email}
                          {o.customer_phone ? ` · ${o.customer_phone}` : ""}
                        </p>

                        <ul className="mt-4 flex flex-col gap-2">
                          {o.order_items.map((item, n) => (
                            <li key={n} className="flex justify-between gap-6 text-[14px]">
                              <span>
                                {item.product_name}
                                <span className="text-ink-mute"> · {item.size_label} × {item.qty}</span>
                              </span>
                              <span className="whitespace-nowrap">
                                {rands(Number(item.unit_price) * Number(item.qty))}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <p className="mt-4 border-t border-hairline pt-3 text-[14px]">
                          Subtotal {rands(Number(o.subtotal))} · {o.collect_from_farm ? "Collection" : "Delivery"}{" "}
                          {Number(o.shipping) === 0 ? "free" : rands(Number(o.shipping))} ·{" "}
                          <strong className="font-medium">Total {rands(Number(o.total))}</strong>
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
