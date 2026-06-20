import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPayfastConfig,
  verifyItnSignature,
  payfastServerConfirm,
  isValidPayfastSource,
} from "@/lib/payfast";
import { computeCommissionCents } from "@/lib/ebook";

export async function POST(request: NextRequest) {
  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!(await isValidPayfastSource(sourceIp))) {
    return new Response("invalid source", { status: 200 });
  }

  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);

  const pairs: [string, string][] = [];
  let signature = "";
  for (const [k, v] of params.entries()) {
    if (k === "signature") signature = v;
    else pairs.push([k, v]);
  }

  const cfg = getPayfastConfig();
  if (!verifyItnSignature(pairs, signature, cfg.passphrase)) {
    return new Response("invalid signature", { status: 200 });
  }
  if (!(await payfastServerConfirm(rawBody))) {
    return new Response("not validated", { status: 200 });
  }

  const data = Object.fromEntries(params.entries());
  if (data["payment_status"] !== "COMPLETE") {
    return new Response("ignored", { status: 200 });
  }

  const orderId = data["m_payment_id"];
  const amountGross = Math.round(
    parseFloat(data["amount_gross"] ?? "0") * 100
  );
  if (!orderId) return new Response("no order", { status: 200 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("ebook_orders")
    .select("id, amount_cents, status, affiliate_id")
    .eq("id", orderId)
    .single();

  if (!order) return new Response("order not found", { status: 200 });

  if (Math.abs(order.amount_cents - amountGross) > 1) {
    return new Response("amount mismatch", { status: 200 });
  }

  if (order.status === "paid") return new Response("OK", { status: 200 });

  await admin
    .from("ebook_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_ref: data["pf_payment_id"] ?? null,
    })
    .eq("id", order.id);

  if (order.affiliate_id) {
    const { data: product } = await admin
      .from("ebook_product")
      .select("commission_type, commission_value")
      .eq("id", 1)
      .single();

    if (product) {
      const amount = computeCommissionCents(
        product.commission_type,
        Number(product.commission_value),
        order.amount_cents
      );
      await admin
        .from("commissions")
        .insert({
          order_id: order.id,
          affiliate_id: order.affiliate_id,
          amount_cents: amount,
          status: "pending",
        });
    }
  }

  return new Response("OK", { status: 200 });
}