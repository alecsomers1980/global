import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatZAR } from "@/lib/catalog";
import {
  ORDER_STATUS_LABELS,
  ACTIVE_STATUSES,
  DONE_STATUSES,
  statusBadgeClass,
  type OrderStatus,
} from "@/lib/orders";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab ?? "current";
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();

  // count: "exact" so the header and pager know the real total — the table
  // itself stays bounded to one page (there are 4,626 orders).
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, full_name, email, total, status, delivery_method, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  // Imported WooCommerce history lives in its own tab — it would otherwise
  // bury the live queue under eight years of old orders.
  if (activeTab === "legacy") {
    query = query.eq("legacy", true);
  } else if (activeTab === "current") {
    query = query.eq("legacy", false).in("status", ACTIVE_STATUSES);
  } else if (activeTab === "completed") {
    query = query.eq("legacy", false).in("status", DONE_STATUSES);
  } else {
    query = query.eq("legacy", false).eq("status", "cancelled");
  }

  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  // The Cancelled tab is already pinned to one status, so the picker can't
  // narrow it further.
  if (status && activeTab !== "cancelled") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * PER_PAGE;
  const { data: orders, count, error } = await query.range(from, from + PER_PAGE - 1);
  if (error) console.error("[admin.orders]", error.message);

  const orderList = orders ?? [];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  const tabs = [
    { label: "Current", value: "current" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Legacy", value: "legacy" },
  ];

  // Switching tab keeps the search and status filter, but starts at page 1.
  const tabHref = (value: string) => {
    const search = new URLSearchParams({ tab: value });
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    return `/admin/orders?${search.toString()}`;
  };

  const hasFilters = Boolean(q || status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Orders</h1>
        <span className="text-sm text-muted">
          {hasFilters ? `${total} matching` : `${total} ${total === 1 ? "order" : "orders"}`}
        </span>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={tabHref(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === t.value
                ? "bg-forest text-paper"
                : "bg-surface-2 text-ink hover:bg-line"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <FilterBar
        action="/admin/orders"
        q={q}
        placeholder="Search order no, name or email…"
        hidden={{ tab: activeTab }}
        hasFilters={hasFilters}
        selects={
          activeTab === "cancelled"
            ? []
            : [
                {
                  name: "status",
                  label: "Any status",
                  value: status,
                  options: Object.entries(ORDER_STATUS_LABELS).map(
                    ([value, label]) => ({ value, label })
                  ),
                },
              ]
        }
      />

      {activeTab === "legacy" && orderList.length > 0 && (
        <p className="text-sm text-muted bg-white border border-line rounded-xl p-4 mb-4">
          Orders imported from the old WooCommerce site. They count towards
          reports and customer spend, but stay out of your working queue.
        </p>
      )}

      {orderList.length === 0 ? (
        <p className="text-sm text-muted bg-white border border-line rounded-xl p-4">
          {hasFilters ? "No orders match." : "No orders here yet."}
        </p>
      ) : (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orderList.map((order) => {
                const orderStatus = order.status as OrderStatus;
                return (
                  <tr key={order.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(order.created_at).toLocaleDateString("en-ZA")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{order.full_name || "—"}</div>
                      <div className="text-xs text-muted">{order.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted capitalize">
                      {order.delivery_method}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {formatZAR(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
                          orderStatus
                        )}`}
                      >
                        {ORDER_STATUS_LABELS[orderStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-forest hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        action="/admin/orders"
        page={page}
        pageCount={pageCount}
        params={{ tab: activeTab, q, status }}
      />
    </div>
  );
}
