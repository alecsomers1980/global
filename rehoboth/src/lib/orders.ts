import { getServerClient } from "./supabase/server";
import { getShippingSettings, shippingFor } from "./shipping";

/**
 * Order creation and payment settlement.
 *
 * The cart lives in the browser's localStorage, so nothing it sends about
 * price is trusted here: createOrder takes only variant ids and quantities and
 * re-prices every line from the database. A tampered cart can change what is
 * bought, never what it costs.
 */

export type CheckoutLine = { variantId: string; qty: number };

export type CheckoutInput = {
  email: string;
  name: string;
  phone?: string;
  collectFromFarm: boolean;
  shipLine1?: string;
  shipCity?: string;
  shipProvince?: string;
  shipPostcode?: string;
  lines: CheckoutLine[];
};

export type CreatedOrder = {
  orderId: string;
  reference: string;
  subtotal: number;
  shipping: number;
  total: number;
};

/** A refusal the checkout page can render; anything else is a 500. */
export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly code: "empty" | "stale_cart" | "invalid" | "not_configured"
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One customer cannot buy more of one variant than the farm would ever ship. */
const MAX_QTY = 99;

export async function createOrder(input: CheckoutInput): Promise<CreatedOrder> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new CheckoutError("Supabase is not configured", "not_configured");
  }
  if (!input.lines.length) {
    throw new CheckoutError("Your cart is empty.", "empty");
  }
  if (input.lines.some((l) => !Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY)) {
    throw new CheckoutError("That quantity is not available.", "invalid");
  }
  if (!input.collectFromFarm && !input.shipLine1) {
    throw new CheckoutError("A delivery address is required.", "invalid");
  }

  // Ids that are not uuids come from the no-database fallback catalogue, which
  // means this cart was filled before the site had a database behind it.
  if (input.lines.some((l) => !UUID.test(l.variantId))) {
    throw new CheckoutError(
      "Your basket was saved before our latest update. Please add the items again.",
      "stale_cart"
    );
  }

  const db = getServerClient();
  const ids = input.lines.map((l) => l.variantId);

  const { data: variants, error } = await db
    .from("product_variants")
    .select("id, size_label, price_retail, active, products(name, active)")
    .in("id", ids);
  if (error) throw new Error(`createOrder: ${error.message}`);

  type Row = {
    id: string;
    size_label: string;
    price_retail: string | number;
    active: boolean;
    products: { name: string; active: boolean } | null;
  };
  const byId = new Map((variants as unknown as Row[]).map((v) => [v.id, v]));

  const items = input.lines.map((line) => {
    const v = byId.get(line.variantId);
    if (!v || !v.active || !v.products?.active) {
      throw new CheckoutError(
        "One of the items in your basket is no longer available. Please review your basket.",
        "stale_cart"
      );
    }
    return {
      variant_id: v.id,
      product_name: v.products.name,
      size_label: v.size_label,
      unit_price: Number(v.price_retail),
      qty: line.qty,
    };
  });

  const subtotal = round2(items.reduce((n, i) => n + i.unit_price * i.qty, 0));
  const shipping = shippingFor(subtotal, input.collectFromFarm, await getShippingSettings());
  const total = round2(subtotal + shipping);

  const { data: order, error: oe } = await db
    .from("orders")
    .insert({
      customer_email: input.email.trim().toLowerCase(),
      customer_name: input.name.trim(),
      customer_phone: input.phone?.trim() || null,
      collect_from_farm: input.collectFromFarm,
      ship_line1: input.collectFromFarm ? null : input.shipLine1?.trim(),
      ship_city: input.collectFromFarm ? null : input.shipCity?.trim(),
      ship_province: input.collectFromFarm ? null : input.shipProvince?.trim(),
      ship_postcode: input.collectFromFarm ? null : input.shipPostcode?.trim(),
      subtotal,
      shipping,
      total,
    })
    .select("id, reference")
    .single();
  if (oe) throw new Error(`createOrder: ${oe.message}`);

  const { error: ie } = await db
    .from("order_items")
    .insert(items.map((i) => ({ order_id: order.id, ...i })));
  if (ie) {
    // An order with no lines is worse than no order: PayFast would take money
    // against a total nobody can itemise.
    await db.from("orders").delete().eq("id", order.id);
    throw new Error(`createOrder items: ${ie.message}`);
  }

  return { orderId: order.id, reference: order.reference, subtotal, shipping, total };
}

/**
 * Settle a paid order. Returns false when the order was not in `pending`,
 * which is the replay case: PayFast re-sends an ITN until it gets a 200, and
 * the same notification must not be applied twice.
 */
export async function markOrderPaid(
  orderId: string,
  payfastPaymentId: string
): Promise<boolean> {
  const db = getServerClient();
  const { data, error } = await db
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payfast_payment_id: payfastPaymentId,
    })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id");
  if (error) throw new Error(`markOrderPaid: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function markOrderFailed(orderId: string, status: "failed" | "cancelled") {
  const db = getServerClient();
  await db.from("orders").update({ status }).eq("id", orderId).eq("status", "pending");
}

export type OrderRecord = {
  id: string;
  reference: string;
  status: string;
  customer_email: string;
  customer_name: string;
  subtotal: number;
  shipping: number;
  total: number;
  collect_from_farm: boolean;
  order_items: {
    product_name: string;
    size_label: string;
    unit_price: number;
    qty: number;
  }[];
};

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  if (!UUID.test(orderId) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const db = getServerClient();
  const { data, error } = await db
    .from("orders")
    .select(
      "id, reference, status, customer_email, customer_name, subtotal, shipping, total, collect_from_farm, order_items(product_name, size_label, unit_price, qty)"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as OrderRecord;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
