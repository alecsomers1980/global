"use server";

import { getServerClient } from "@/lib/supabase/server";

export type MyOrder = {
  reference: string;
  status: string;
  total: number;
  created_at: string;
  collect_from_farm: boolean;
  order_items: { product_name: string; size_label: string; unit_price: number; qty: number }[];
};

export type MyOrdersResult =
  | { ok: true; email: string; orders: MyOrder[] }
  | { ok: false; error: string };

/**
 * A signed-in customer's order history.
 *
 * supabase-js keeps the session in localStorage, so a server component cannot
 * read it — the browser has to hand the access token over and the server has to
 * verify it. getUser(token) does that against Supabase, so a forged token gets
 * nothing. The email then comes from the VERIFIED user, never from the caller,
 * which is what stops someone reading another customer's orders by asking.
 */
export async function getMyOrders(accessToken: string): Promise<MyOrdersResult> {
  if (!accessToken) return { ok: false, error: "Please sign in to see your orders." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Orders are not available just now." };
  }

  const db = getServerClient();

  const { data: auth, error: authError } = await db.auth.getUser(accessToken);
  if (authError || !auth.user?.email) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const email = auth.user.email.toLowerCase();
  const { data, error } = await db
    .from("orders")
    .select(
      "reference, status, total, created_at, collect_from_farm, order_items(product_name, size_label, unit_price, qty)"
    )
    .eq("customer_email", email)
    // A pending order is one PayFast never confirmed. Showing it as an order
    // would have people believe they had bought something they had not.
    .in("status", ["paid", "fulfilled"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[account] order lookup failed", error.message);
    return { ok: false, error: "We could not load your orders just now." };
  }

  return { ok: true, email, orders: (data ?? []) as unknown as MyOrder[] };
}
