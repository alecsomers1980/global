/** Customer aggregation for the admin screens.
 *
 *  Reads go through the normal server client: `profiles` is staff-readable
 *  ("read own profile" allows `is_staff()`) and so is `orders` ("read own
 *  orders"), and /admin/* is already staff-gated in src/proxy.ts.
 *
 *  Only PAID_STATUSES count towards spend — an unpaid "received" order is not
 *  money, and a cancelled one never was.
 */

import { createClient } from "@/lib/supabase/server";
import { PAID_STATUSES } from "@/lib/orders";
import { fetchAll } from "@/lib/db";

export type CustomerSummary = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  monthSpent: number;
  lastOrderAt: string | null;
};

export type MonthlySpend = {
  /** YYYY-MM */
  month: string;
  label: string;
  orders: number;
  spent: number;
};

/** First instant of the current month, in the server's local zone. */
function startOfThisMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  });
}

export type CustomerSort = "recent" | "spend" | "orders" | "name";
export type CustomerFilter = "all" | "buyers" | "no-orders" | "month";

export type CustomerQuery = {
  /** Matches name, email or phone. */
  q?: string;
  filter?: CustomerFilter;
  sort?: CustomerSort;
  page?: number;
  perPage?: number;
};

export type CustomerPage = {
  customers: CustomerSummary[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

/** Every customer, with lifetime and this-month spend.
 *
 *  Both selects page via fetchAll: there are 1,885 customers and ~3,400 paid
 *  orders with a user, and PostgREST would silently return only the first
 *  1000 of each — which showed up as missing customers and understated spend. */
export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = await createClient();

  const [profiles, orders] = await Promise.all([
    fetchAll<{
      id: string;
      email: string | null;
      full_name: string | null;
      phone: string | null;
      created_at: string;
    }>((from, to) =>
      supabase
        .from("profiles")
        .select("id, email, full_name, phone, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    fetchAll<{ user_id: string; total: number | string; created_at: string }>(
      (from, to) =>
        supabase
          .from("orders")
          .select("user_id, total, created_at")
          .in("status", PAID_STATUSES)
          .not("user_id", "is", null)
          .range(from, to)
    ),
  ]);

  const monthStart = startOfThisMonth();
  const byUser = new Map<
    string,
    { count: number; total: number; month: number; last: string | null }
  >();

  for (const order of orders ?? []) {
    const key = order.user_id as string;
    const stats =
      byUser.get(key) ?? { count: 0, total: 0, month: 0, last: null };
    const amount = Number(order.total) || 0;
    stats.count += 1;
    stats.total += amount;
    if (new Date(order.created_at) >= monthStart) stats.month += amount;
    if (!stats.last || order.created_at > stats.last) stats.last = order.created_at;
    byUser.set(key, stats);
  }

  return (profiles ?? []).map((p) => {
    const stats = byUser.get(p.id);
    return {
      id: p.id,
      email: p.email ?? "",
      fullName: p.full_name ?? "",
      phone: p.phone ?? "",
      createdAt: p.created_at,
      orderCount: stats?.count ?? 0,
      totalSpent: stats?.total ?? 0,
      monthSpent: stats?.month ?? 0,
      lastOrderAt: stats?.last ?? null,
    };
  });
}

/**
 * Search / filter / sort / page the customer list.
 *
 * Done in memory on purpose: spend is aggregated from the orders table rather
 * than stored on the profile, so sorting or filtering by spend can't be pushed
 * into PostgREST without a view. ~1,885 customers is small enough that this is
 * cheaper than the migration. Revisit if the list reaches tens of thousands.
 */
export async function searchCustomers({
  q = "",
  filter = "all",
  sort = "recent",
  page = 1,
  perPage = 50,
}: CustomerQuery): Promise<CustomerPage> {
  const all = await getCustomers();
  const needle = q.trim().toLowerCase();

  let rows = all;

  if (needle) {
    rows = rows.filter(
      (c) =>
        c.fullName.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle)
    );
  }

  if (filter === "buyers") rows = rows.filter((c) => c.orderCount > 0);
  else if (filter === "no-orders") rows = rows.filter((c) => c.orderCount === 0);
  else if (filter === "month") rows = rows.filter((c) => c.monthSpent > 0);

  const sorters: Record<CustomerSort, (a: CustomerSummary, b: CustomerSummary) => number> = {
    recent: (a, b) => (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""),
    spend: (a, b) => b.totalSpent - a.totalSpent,
    orders: (a, b) => b.orderCount - a.orderCount,
    name: (a, b) => (a.fullName || a.email).localeCompare(b.fullName || b.email),
  };
  rows = [...rows].sort(sorters[sort] ?? sorters.recent);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * perPage;

  return {
    customers: rows.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    pageCount,
  };
}

export type CustomerOrder = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  delivery_method: string;
  created_at: string;
};

export type CustomerDetail = {
  profile: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    createdAt: string;
    marketingOptIn: boolean;
  };
  orders: CustomerOrder[];
  monthly: MonthlySpend[];
  totalSpent: number;
  paidOrderCount: number;
};

/** One customer: their profile, every order, and a monthly spend breakdown.
 *  Returns null if the id isn't a customer (staff/admin rows are out of scope
 *  for this screen — see the guard in the API routes). */
export async function getCustomerDetail(
  id: string
): Promise<CustomerDetail | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, created_at, marketing_opt_in, role")
    .eq("id", id)
    .maybeSingle();

  if (!profile || profile.role !== "customer") return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, delivery_method, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const orderList = (orders ?? []) as CustomerOrder[];
  const paid = orderList.filter((o) =>
    PAID_STATUSES.includes(o.status as never)
  );

  const buckets = new Map<string, { orders: number; spent: number }>();
  for (const order of paid) {
    const key = monthKey(order.created_at);
    const bucket = buckets.get(key) ?? { orders: 0, spent: 0 };
    bucket.orders += 1;
    bucket.spent += Number(order.total) || 0;
    buckets.set(key, bucket);
  }

  const monthly: MonthlySpend[] = [...buckets.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, bucket]) => ({
      month,
      label: monthLabel(month),
      orders: bucket.orders,
      spent: bucket.spent,
    }));

  return {
    profile: {
      id: profile.id,
      email: profile.email ?? "",
      fullName: profile.full_name ?? "",
      phone: profile.phone ?? "",
      createdAt: profile.created_at,
      marketingOptIn: Boolean(profile.marketing_opt_in),
    },
    orders: orderList,
    monthly,
    totalSpent: paid.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    paidOrderCount: paid.length,
  };
}
