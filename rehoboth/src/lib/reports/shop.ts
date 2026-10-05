import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportPeriod } from "./period";

/**
 * Shop figures for one month, straight from Supabase.
 *
 * Revenue belongs to the month an order was PAID, not the month it was
 * started: a checkout opened on the 31st and paid on the 1st is the new
 * month's money. Everest attributes by created_at only because it has no paid
 * date; this shop has one.
 */

export type ProductLine = { product: string; size: string; units: number; revenue: number };

export type ShopMetrics = {
  paidOrders: number;
  revenue: number;
  averageOrder: number;
  delivered: number;
  collected: number;
  unpaidCheckouts: number;
  topByRevenue: ProductLine[];
  topByUnits: ProductLine[];
  newCustomers: number;
  messages: number;
  stockistApplications: number;
  stockistsApproved: number;
  articles: { title: string; publishedAt: string }[];
  articlesLive: number;
};

export type PaidOrderRow = {
  total: number | string;
  collect_from_farm: boolean;
  order_items: { product_name: string; size_label: string; unit_price: number | string; qty: number }[];
};

/** Pure: everything that can be worked out from the month's paid orders. */
export function summariseOrders(orders: PaidOrderRow[]) {
  const revenue = round2(orders.reduce((sum, o) => sum + Number(o.total), 0));
  const collected = orders.filter((o) => o.collect_from_farm).length;

  // Grouped by name AND size: a 50g and a 100g bag are different things to
  // stock, and lumping them hides which one is actually selling.
  const lines = new Map<string, ProductLine>();
  for (const order of orders) {
    for (const item of order.order_items) {
      const key = `${item.product_name}\u0000${item.size_label}`;
      const line = lines.get(key) ?? {
        product: item.product_name,
        size: item.size_label,
        units: 0,
        revenue: 0,
      };
      line.units += item.qty;
      line.revenue = round2(line.revenue + item.qty * Number(item.unit_price));
      lines.set(key, line);
    }
  }
  const all = [...lines.values()];

  return {
    paidOrders: orders.length,
    revenue,
    averageOrder: orders.length ? round2(revenue / orders.length) : 0,
    delivered: orders.length - collected,
    collected,
    topByRevenue: [...all].sort((a, b) => b.revenue - a.revenue || b.units - a.units).slice(0, 5),
    topByUnits: [...all].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5),
  };
}

export async function fetchShopMetrics(db: SupabaseClient, period: ReportPeriod): Promise<ShopMetrics> {
  const { startUtc, endUtc } = period;

  const count = async (table: string, column: string, extra?: (q: any) => any) => {
    let q = db.from(table).select("*", { count: "exact", head: true }).gte(column, startUtc).lt(column, endUtc);
    if (extra) q = extra(q);
    const { count: n, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    return n ?? 0;
  };

  const [orders, unpaidCheckouts, newCustomers, messages, stockistApplications, stockistsApproved, articles, live] =
    await Promise.all([
      paidOrders(db, period),
      count("orders", "created_at", (q) => q.in("status", ["pending", "failed", "cancelled"])),
      count("customers", "created_at"),
      count("contact_messages", "created_at"),
      count("stockist_applications", "created_at"),
      count("stockist_applications", "updated_at", (q) => q.eq("status", "approved")),
      db
        .from("news_posts")
        .select("title, published_at")
        .eq("published", true)
        .gte("published_at", startUtc)
        .lt("published_at", endUtc)
        .order("published_at"),
      db.from("news_posts").select("id", { count: "exact", head: true }).eq("published", true),
    ]);

  if (articles.error) throw new Error(`news_posts: ${articles.error.message}`);
  if (live.error) throw new Error(`news_posts: ${live.error.message}`);

  return {
    ...summariseOrders(orders),
    unpaidCheckouts,
    newCustomers,
    messages,
    stockistApplications,
    stockistsApproved,
    articles: (articles.data ?? []).map((a) => ({ title: a.title, publishedAt: a.published_at })),
    articlesLive: live.count ?? 0,
  };
}

/** Paged: PostgREST caps a select at 1000 rows and truncates silently. */
async function paidOrders(db: SupabaseClient, period: ReportPeriod): Promise<PaidOrderRow[]> {
  const PAGE = 1000;
  const rows: PaidOrderRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("orders")
      .select("total, collect_from_farm, order_items(product_name, size_label, unit_price, qty)")
      .in("status", ["paid", "fulfilled"])
      .gte("paid_at", period.startUtc)
      .lt("paid_at", period.endUtc)
      .order("paid_at")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`orders: ${error.message}`);
    rows.push(...((data ?? []) as PaidOrderRow[]));
    if (!data || data.length < PAGE) return rows;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
