"use server";

import { asAdmin, RefusedError } from "@/lib/admin";
import { getServerClient } from "@/lib/supabase/server";
import { screen } from "@/lib/compliance";

export type ProductCopy = {
  name: string;
  botanical_name: string;
  summary: string;
  traditional_use: string;
  ingredients: string;
  directions: string;
  storage: string;
  active: boolean;
};

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

/* ------------------------------------------------------------------ orders */

export type AdminOrder = {
  id: string;
  reference: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  ship_line1: string | null;
  ship_city: string | null;
  ship_province: string | null;
  ship_postcode: string | null;
  collect_from_farm: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  paid_at: string | null;
  order_items: { product_name: string; size_label: string; unit_price: number; qty: number }[];
};

export async function listOrders(token: string, status?: string): Promise<ActionResult<AdminOrder[]>> {
  return asAdmin(token, async () => {
    let q = getServerClient()
      .from("orders")
      .select(
        "id, reference, status, customer_name, customer_email, customer_phone, ship_line1, ship_city, ship_province, ship_postcode, collect_from_farm, subtotal, shipping, total, created_at, paid_at, order_items(product_name, size_label, unit_price, qty)"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (status && status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AdminOrder[];
  });
}

export async function markFulfilled(token: string, orderId: string): Promise<ActionResult> {
  return asAdmin(token, async () => {
    // Only a paid order can be sent. Fulfilling an unpaid one would quietly
    // write off money nobody has received.
    const { data, error } = await getServerClient()
      .from("orders")
      .update({ status: "fulfilled" })
      .eq("id", orderId)
      .eq("status", "paid")
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new RefusedError("Only a paid order can be marked as sent.");
    return null;
  });
}

/* --------------------------------------------------------------- stockists */

export type AdminStockist = {
  id: string;
  status: string;
  business: string;
  contact: string;
  email: string;
  phone: string;
  town: string;
  stocking: string | null;
  created_at: string;
};

export async function listStockists(token: string, status?: string): Promise<ActionResult<AdminStockist[]>> {
  return asAdmin(token, async () => {
    let q = getServerClient()
      .from("stockist_applications")
      .select("id, status, business, contact, email, phone, town, stocking, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (status && status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminStockist[];
  });
}

export async function setStockistStatus(
  token: string,
  id: string,
  status: "new" | "contacted" | "approved" | "declined"
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    const { error } = await getServerClient()
      .from("stockist_applications")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return null;
  });
}

/* ---------------------------------------------------------------- products */

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  botanical_name: string | null;
  summary: string | null;
  traditional_use: string | null;
  ingredients: string | null;
  directions: string | null;
  storage: string | null;
  active: boolean;
  product_variants: {
    id: string;
    size_label: string;
    price_retail: number;
    price_trade: number | null;
    stock: number | null;
    active: boolean;
  }[];
};

export async function listProducts(token: string): Promise<ActionResult<AdminProduct[]>> {
  return asAdmin(token, async () => {
    const { data, error } = await getServerClient()
      .from("products")
      .select(
        "id, slug, name, botanical_name, summary, traditional_use, ingredients, directions, storage, active, product_variants(id, size_label, price_retail, price_trade, stock, active)"
      )
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AdminProduct[];
  });
}

/**
 * Save product copy.
 *
 * This is the gate that stops a medical claim reaching the live site through
 * the admin rather than through code. It runs the same screen() the build-time
 * scan uses, and refuses the save with the offending words named.
 */
export async function saveProduct(
  token: string,
  id: string,
  fields: ProductCopy
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    // Every free-text field, not just the obvious one — a claim moved into
    // "storage" is still a claim on the live page.
    const hit = screen(
      fields.name,
      fields.botanical_name,
      fields.summary,
      fields.traditional_use,
      fields.ingredients,
      fields.directions,
      fields.storage
    );
    if (hit.flagged) {
      throw new RefusedError(
        `That wording cannot be published: ${hit.hits.join(", ")}. ` +
          `We may describe the plant and how it is traditionally used, but not what it treats.`
      );
    }

    const { error } = await getServerClient()
      .from("products")
      .update({
        name: fields.name.trim(),
        botanical_name: fields.botanical_name.trim() || null,
        summary: fields.summary.trim() || null,
        traditional_use: fields.traditional_use.trim() || null,
        ingredients: fields.ingredients.trim() || null,
        directions: fields.directions.trim() || null,
        storage: fields.storage.trim() || null,
        active: fields.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return null;
  });
}

export async function saveVariant(
  token: string,
  id: string,
  fields: { price_retail: number; price_trade: number | null; stock: number | null; active: boolean }
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    if (!Number.isFinite(fields.price_retail) || fields.price_retail < 0) {
      throw new RefusedError("That retail price is not a number.");
    }
    const { error } = await getServerClient()
      .from("product_variants")
      .update({
        price_retail: fields.price_retail,
        price_trade: fields.price_trade,
        stock: fields.stock,
        active: fields.active,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return null;
  });
}

/* ---------------------------------------------------------------- settings */

export async function getSettings(token: string): Promise<ActionResult<Record<string, unknown>>> {
  return asAdmin(token, async () => {
    const { data, error } = await getServerClient().from("site_settings").select("key, value");
    if (error) throw new Error(error.message);
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  });
}

export async function saveShipping(
  token: string,
  value: { flat: number; free_over: number; collect_from_farm: boolean }
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    if (!Number.isFinite(value.flat) || value.flat < 0) throw new RefusedError("That delivery rate is not a number.");
    if (!Number.isFinite(value.free_over) || value.free_over < 0) {
      throw new RefusedError("That free-delivery threshold is not a number.");
    }
    const { error } = await getServerClient()
      .from("site_settings")
      .upsert({ key: "shipping", value, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return null;
  });
}
