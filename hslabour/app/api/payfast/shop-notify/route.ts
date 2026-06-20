import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPayfastConfig,
  verifyItnSignature,
  payfastServerConfirm,
  isValidPayfastSource,
} from "@/lib/payfast";

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
    return new Response("invalid", { status: 200 });
  }

  const confirmed = await payfastServerConfirm(rawBody);
  if (!confirmed) {
    return new Response("not validated", { status: 200 });
  }

  const data = Object.fromEntries(params.entries());
  if (data["payment_status"] !== "COMPLETE") {
    return new Response("ignored", { status: 200 });
  }

  const orderId = data["m_payment_id"];
  const amountGross = Math.round(parseFloat(data["amount_gross"] ?? "0") * 100);

  if (!orderId) {
    return new Response("no order", { status: 200 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("shop_orders")
    .select(
      "id, amount_cents, status, product_id, product_name, buyer_email, buyer_name, brief, consent_at"
    )
    .eq("id", orderId)
    .single();

  if (!order) {
    return new Response("order not found", { status: 200 });
  }

  if (Math.abs(order.amount_cents - amountGross) > 1) {
    return new Response("amount mismatch", { status: 200 });
  }

  if (order.status === "paid") {
    return new Response("OK", { status: 200 });
  }

  await admin
    .from("shop_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_ref: data["pf_payment_id"] ?? null,
    })
    .eq("id", order.id);

  // For done-for-you services, open a job in the pipeline.
  if (order.product_id) {
    const { data: product } = await admin
      .from("shop_products")
      .select("kind, revisions, requires_appointment, sla_hours")
      .eq("id", order.product_id)
      .single();

    if (product && product.kind === "service") {
      const slaDueAt =
        product.sla_hours && product.sla_hours > 0
          ? new Date(Date.now() + product.sla_hours * 3600 * 1000).toISOString()
          : null;
      await admin.from("service_jobs").insert({
        order_id: order.id,
        product_name: order.product_name,
        buyer_email: order.buyer_email,
        buyer_name: order.buyer_name,
        brief: order.brief,
        status: "received",
        revisions_remaining: product.revisions ?? 0,
        consent_at: order.consent_at ?? null,
        requires_appointment: product.requires_appointment ?? false,
        sla_due_at: slaDueAt,
      });
    }
  }

  return new Response("OK", { status: 200 });
}