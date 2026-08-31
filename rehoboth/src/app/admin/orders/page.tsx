"use client";

import { Fragment, useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { rands } from "@/lib/money";
import { listOrders, markFulfilled, type AdminOrder } from "../actions";

const FILTERS = [
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All" },
];

const TH = "border-b border-hairline px-3 py-3 text-left text-[12px] uppercase tracking-[0.08em] text-ink-mute";
const TD = "border-b border-hairline px-3 py-3 align-top text-ink";
const SMALL_BTN =
  "min-h-[40px] border border-hairline px-3 text-[13px] text-ink-soft hover:border-brand hover:text-brand disabled:opacity-50";

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

  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <button type="button" onClick={downloadCsv} disabled={orders.length === 0} className={SMALL_BTN}>
          Download CSV
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "min-h-[40px] bg-brand px-4 text-[13px] uppercase tracking-[0.06em] text-brand-ink"
                : "min-h-[40px] border border-hairline px-4 text-[13px] uppercase tracking-[0.06em] text-ink-soft hover:border-brand"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-ink-mute">No orders here yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
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
                    <td className={TD}>{o.status === "fulfilled" ? "Sent" : titleCase(o.status)}</td>
                    <td className={TD}>
                      {o.status === "paid" && (
                        <button type="button" onClick={() => markSent(o.id)} disabled={busyId === o.id} className={SMALL_BTN}>
                          Mark sent
                        </button>
                      )}
                    </td>
                  </tr>

                  {expandedId === o.id && (
                    <tr>
                      <td colSpan={7} className="border-b border-hairline bg-surface px-3 py-5 align-top text-ink">
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
        </div>
      )}
    </div>
  );
}
