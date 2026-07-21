/** Monthly sales report aggregation.
 *
 *  Only PAID_STATUSES count as revenue. Everything is computed from the
 *  order/order_items snapshots, so a report of a past month never changes when
 *  the catalogue does.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { PAID_STATUSES } from "@/lib/orders";
import { fetchAll } from "@/lib/db";

export type TopProduct = {
  title: string;
  units: number;
  revenue: number;
};

export type ReportCustomer = {
  name: string;
  email: string;
  orders: number;
  spent: number;
  items: string[];
  isNew: boolean;
};

export type MonthlyReport = {
  /** e.g. "June 2026" */
  label: string;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  /** Previous month, for the trend line. */
  previousSales: number;
  previousOrderCount: number;
  /** Percentage change vs the previous month; null when there's no base. */
  salesChangePct: number | null;
  newCustomers: number;
  repeatCustomers: number;
  guestOrders: number;
  topProducts: TopProduct[];
  customers: ReportCustomer[];
};

type OrderRow = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  total: number | string;
  created_at: string;
};

/** The month containing `ref`, as a [start, end) pair. */
function monthRange(ref: Date): { start: Date; end: Date } {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  return { start, end };
}

function pct(current: number, previous: number): number | null {
  if (previous <= 0) return null; // no meaningful baseline
  return ((current - previous) / previous) * 100;
}

/**
 * Build the report for the month containing `ref` (defaults to LAST month,
 * which is what the 1st-of-the-month cron wants).
 */
export async function buildMonthlyReport(ref?: Date): Promise<MonthlyReport> {
  const now = new Date();
  const target = ref ?? new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const { start, end } = monthRange(target);
  const prev = monthRange(new Date(start.getFullYear(), start.getMonth() - 1, 1));

  const admin = createAdminClient();

  // Every query here pages via fetchAll — PostgREST silently truncates at 1000
  // rows, and a busy month easily exceeds that in line items alone.

  // This month's paid orders…
  const rows = await fetchAll<OrderRow>((from, to) =>
    admin
      .from("orders")
      .select("id, user_id, email, full_name, total, created_at")
      .in("status", PAID_STATUSES)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .range(from, to)
  );

  const orderIds = rows.map((o) => o.id);

  // …their line items…
  const items: any[] = [];
  // .in() with thousands of ids makes an enormous URL, so chunk the ids too.
  for (let i = 0; i < orderIds.length; i += 200) {
    const chunk = orderIds.slice(i, i + 200);
    const part = await fetchAll<any>((from, to) =>
      admin
        .from("order_items")
        .select("order_id, product_title, size, qty, line_total")
        .in("order_id", chunk)
        .range(from, to)
    );
    items.push(...part);
  }

  // …and last month's totals, for the trend.
  const prevOrders = await fetchAll<{ total: number | string }>((from, to) =>
    admin
      .from("orders")
      .select("total")
      .in("status", PAID_STATUSES)
      .gte("created_at", prev.start.toISOString())
      .lt("created_at", prev.end.toISOString())
      .range(from, to)
  );

  const totalSales = rows.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const orderCount = rows.length;
  const previousSales = (prevOrders ?? []).reduce(
    (sum, o: any) => sum + (Number(o.total) || 0),
    0
  );

  // ── Top products (by revenue) ──
  const productTotals = new Map<string, TopProduct>();
  const itemsByOrder = new Map<string, string[]>();
  for (const item of (items ?? []) as any[]) {
    const title = item.product_title || "Unknown product";
    const entry = productTotals.get(title) ?? { title, units: 0, revenue: 0 };
    entry.units += Number(item.qty) || 0;
    entry.revenue += Number(item.line_total) || 0;
    productTotals.set(title, entry);

    const label = item.size ? `${title} (${item.size})` : title;
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(`${label} ×${item.qty}`);
    itemsByOrder.set(item.order_id, list);
  }
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── New vs repeat ──
  // "Repeat" = this signed-in customer had a paid order BEFORE this month.
  // Guests (user_id null) can't be tracked across orders, so they're counted
  // separately rather than guessed at.
  const userIds = [...new Set(rows.map((o) => o.user_id).filter(Boolean))] as string[];
  const priorBuyers = new Set<string>();
  // Truncation here would silently report returning customers as new, so page
  // it and chunk the id list.
  for (let i = 0; i < userIds.length; i += 200) {
    const chunk = userIds.slice(i, i + 200);
    const prior = await fetchAll<{ user_id: string }>((from, to) =>
      admin
        .from("orders")
        .select("user_id")
        .in("status", PAID_STATUSES)
        .in("user_id", chunk)
        .lt("created_at", start.toISOString())
        .range(from, to)
    );
    for (const row of prior) priorBuyers.add(row.user_id);
  }

  // ── Customer appendix: who bought, and what ──
  const byCustomer = new Map<string, ReportCustomer>();
  for (const order of rows) {
    // Guests have no user_id, so fall back to their email as the identity.
    const key = order.user_id ?? `guest:${order.email.toLowerCase()}`;
    const entry =
      byCustomer.get(key) ??
      ({
        name: order.full_name || order.email,
        email: order.email,
        orders: 0,
        spent: 0,
        items: [],
        isNew: order.user_id ? !priorBuyers.has(order.user_id) : true,
      } as ReportCustomer);
    entry.orders += 1;
    entry.spent += Number(order.total) || 0;
    entry.items.push(...(itemsByOrder.get(order.id) ?? []));
    byCustomer.set(key, entry);
  }

  const customers = [...byCustomer.values()].sort((a, b) => b.spent - a.spent);

  return {
    label: start.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    totalSales,
    orderCount,
    averageOrderValue: orderCount ? totalSales / orderCount : 0,
    previousSales,
    previousOrderCount: (prevOrders ?? []).length,
    salesChangePct: pct(totalSales, previousSales),
    newCustomers: customers.filter((c) => c.isNew).length,
    repeatCustomers: customers.filter((c) => !c.isNew).length,
    guestOrders: rows.filter((o) => !o.user_id).length,
    topProducts,
    customers,
  };
}
