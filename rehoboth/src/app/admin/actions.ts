"use server";

import { asAdmin, RefusedError } from "@/lib/admin";
import { getServerClient } from "@/lib/supabase/server";
import { screen } from "@/lib/compliance";
import { cleanSocial, type SocialLinks } from "@/lib/social";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";

export type ProductCopy = {
  name: string;
  hero_image: string | null;
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
  hero_image: string | null;
  active: boolean;
  product_variants: {
    id: string;
    size_label: string;
    format: string;
    price_retail: number;
    price_trade: number | null;
    stock: number | null;
    image_url: string | null;
    sort_order: number;
    active: boolean;
  }[];
};

export async function listProducts(token: string): Promise<ActionResult<AdminProduct[]>> {
  return asAdmin(token, async () => {
    const { data, error } = await getServerClient()
      .from("products")
      .select(
        "id, slug, name, botanical_name, summary, traditional_use, ingredients, directions, storage, hero_image, active, product_variants(id, size_label, format, price_retail, price_trade, stock, image_url, sort_order, active)"
      )
      .order("name");
    if (error) throw new Error(error.message);
    const products = (data ?? []) as unknown as AdminProduct[];
    // Postgrest does not order an embedded table for us, and a size list that
    // reshuffles between loads makes it impossible to be sure which row you
    // just edited.
    for (const p of products) p.product_variants.sort((a, b) => a.sort_order - b.sort_order);
    return products;
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

    const db = getServerClient();
    // Read the outgoing photo before overwriting it, so a replaced upload can
    // be swept afterwards rather than left in the bucket forever.
    const { data: before } = await db.from("products").select("hero_image").eq("id", id).single();

    const { error } = await db
      .from("products")
      .update({
        name: fields.name.trim(),
        botanical_name: fields.botanical_name.trim() || null,
        summary: fields.summary.trim() || null,
        traditional_use: fields.traditional_use.trim() || null,
        ingredients: fields.ingredients.trim() || null,
        directions: fields.directions.trim() || null,
        storage: fields.storage.trim() || null,
        hero_image: fields.hero_image,
        active: fields.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    if (before?.hero_image && before.hero_image !== fields.hero_image) {
      await deleteProductImage(before.hero_image);
    }
    return null;
  });
}

export async function saveVariant(
  token: string,
  id: string,
  fields: {
    price_retail: number;
    price_trade: number | null;
    stock: number | null;
    image_url: string | null;
    active: boolean;
  }
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    if (!Number.isFinite(fields.price_retail) || fields.price_retail < 0) {
      throw new RefusedError("That retail price is not a number.");
    }
    const db = getServerClient();
    const { data: before } = await db
      .from("product_variants")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await db
      .from("product_variants")
      .update({
        price_retail: fields.price_retail,
        price_trade: fields.price_trade,
        stock: fields.stock,
        image_url: fields.image_url,
        active: fields.active,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    if (before?.image_url && before.image_url !== fields.image_url) {
      await deleteProductImage(before.image_url);
    }
    return null;
  });
}

/* ------------------------------------------------------------------ photos */

// SVG is deliberately absent: it can carry script, and nothing here needs it.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/**
 * Take a photograph from the admin and put it in the bucket.
 *
 * The browser has already shrunk it (lib/image-resize.ts), so a normal upload
 * arrives around 200KB and these limits are a backstop for a browser where
 * that failed — not the main control.
 */
export async function uploadImage(token: string, form: FormData): Promise<ActionResult<string>> {
  return asAdmin(token, async () => {
    const file = form.get("file");
    if (!(file instanceof File)) throw new RefusedError("No photo came through. Try again.");
    if (!IMAGE_TYPES.includes(file.type)) {
      throw new RefusedError("Photos need to be JPEG, PNG or WebP.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new RefusedError("That photo is too big. Anything under 6MB is fine.");
    }
    return uploadProductImage(await file.arrayBuffer(), file.name, file.type);
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

/* ---------------------------------------------------------------- messages */

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  emailed: boolean;
  created_at: string;
};

export async function listMessages(token: string, filter?: string): Promise<ActionResult<AdminMessage[]>> {
  return asAdmin(token, async () => {
    let q = getServerClient()
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, handled, emailed, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter === "open") q = q.eq("handled", false);
    if (filter === "handled") q = q.eq("handled", true);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminMessage[];
  });
}

export async function setMessageHandled(
  token: string,
  id: string,
  handled: boolean
): Promise<ActionResult> {
  return asAdmin(token, async () => {
    const { error } = await getServerClient()
      .from("contact_messages")
      .update({ handled })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return null;
  });
}

/* ------------------------------------------------------------------ social */

export async function saveSocial(token: string, links: Record<string, string>): Promise<ActionResult<SocialLinks>> {
  return asAdmin(token, async () => {
    // Anything that is not an http(s) URL is dropped rather than stored — a
    // stored "javascript:" would be rendered as a link in the footer.
    const value = cleanSocial(links);
    const supplied = Object.entries(links).filter(([, v]) => String(v).trim() !== "").length;
    const kept = Object.values(value).filter(Boolean).length;
    if (kept < supplied) {
      throw new RefusedError(
        "One of those is not a web address. Paste the full link, starting with https://"
      );
    }
    const { error } = await getServerClient()
      .from("site_settings")
      .upsert({ key: "social", value, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return value;
  });
}

/* --------------------------------------------------------------- dashboard */

export type DashboardSummary = {
  toSend: number;
  awaitingPayment: number;
  messagesToAnswer: number;
  newStockists: number;
  productsLive: number;
  recent: {
    id: string;
    reference: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
};

/**
 * The first screen after signing in.
 *
 * Every figure here answers "is anything waiting for me?" — a paid order not
 * yet sent, an unanswered message. Lifetime totals are a vanity number and
 * would push the two counts that actually need acting on off the top row.
 */
export async function getDashboard(token: string): Promise<ActionResult<DashboardSummary>> {
  return asAdmin(token, async () => {
    const db = getServerClient();
    const count = async (table: string, column: string, value: string | boolean) => {
      const { count: n, error } = await db
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq(column, value);
      if (error) throw new Error(error.message);
      return n ?? 0;
    };

    const [toSend, awaitingPayment, messagesToAnswer, newStockists, productsLive, recent] =
      await Promise.all([
        count("orders", "status", "paid"),
        count("orders", "status", "pending"),
        count("contact_messages", "handled", false),
        count("stockist_applications", "status", "new"),
        count("products", "active", true),
        db
          .from("orders")
          .select("id, reference, customer_name, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    if (recent.error) throw new Error(recent.error.message);

    return {
      toSend,
      awaitingPayment,
      messagesToAnswer,
      newStockists,
      productsLive,
      recent: (recent.data ?? []) as DashboardSummary["recent"],
    };
  });
}
