import { NextRequest, NextResponse } from "next/server";
import { getYocoSettings, verifyWebhookSignature } from "@/lib/yoco";
import { getOrder, markOrderPaid, markOrderFailed } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";

/**
 * Yoco webhook — the only thing that may mark an order paid.
 *
 * The customer's browser returning to /checkout/success proves nothing: that
 * URL can be opened by anyone, with any order id. Payment is settled here and
 * nowhere else, and only after the signature verifies and the amount matches
 * what we actually charged.
 *
 * On the responses: a request that fails the signature check gets a 401,
 * because it either did not come from Yoco or our stored webhook secret is
 * wrong — and the second case needs to show up as a failed delivery in Yoco's
 * dashboard rather than be silently swallowed. Everything we deliberately
 * ignore gets a 200, since Yoco retries a non-2xx seven times over ten hours
 * and there is nothing to retry.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = () => new NextResponse("OK", { status: 200 });

type YocoEvent = {
  id?: string;
  type?: string;
  payload?: {
    id?: string;
    status?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, string>;
  };
};

export async function POST(req: NextRequest) {
  // The raw text, not a parsed body: the signature covers the bytes exactly as
  // sent, and re-serialising the JSON would change them.
  const raw = await req.text();

  const { webhook_secret } = await getYocoSettings();
  if (!webhook_secret) {
    console.error("[yoco:webhook] no webhook secret stored — cannot verify, refusing");
    return new NextResponse("Not configured", { status: 401 });
  }

  const verified = verifyWebhookSignature({
    secret: webhook_secret,
    webhookId: req.headers.get("webhook-id"),
    webhookTimestamp: req.headers.get("webhook-timestamp"),
    signatureHeader: req.headers.get("webhook-signature"),
    rawBody: raw,
  });
  if (!verified) {
    console.error("[yoco:webhook] rejected: signature did not verify");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: YocoEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    console.error("[yoco:webhook] rejected: body is not JSON");
    return ok();
  }

  const orderId = event.payload?.metadata?.orderId ?? "";
  const reject = (why: string) =>
    console.error(`[yoco:webhook] ignored (${why}) order=${orderId || "?"} type=${event.type}`);

  // Refunds and anything else Yoco adds later are acknowledged, not acted on.
  if (event.type !== "payment.succeeded" && event.type !== "payment.failed") {
    console.info(`[yoco:webhook] ignoring ${event.type}`);
    return ok();
  }

  if (!orderId) {
    reject("event carried no orderId in metadata");
    return ok();
  }

  const order = await getOrder(orderId);
  if (!order) {
    reject("no such order");
    return ok();
  }

  if (event.type === "payment.failed") {
    await markOrderFailed(order.id, "failed");
    console.warn(`[yoco:webhook] order ${order.reference} failed`);
    return ok();
  }

  // The amount Yoco collected must be the amount we asked for. Compared in
  // whole cents — Yoco sends cents, and converting our total to a float to
  // meet it is a rounding bug waiting to approve an order a cent short.
  const cents = event.payload?.amount;
  if (!Number.isInteger(cents) || cents !== Math.round(order.total * 100)) {
    reject(`amount ${cents} != order total ${Math.round(order.total * 100)} cents`);
    return ok();
  }

  const transitioned = await markOrderPaid(order.id, event.payload?.id ?? "");
  if (!transitioned) {
    // Already settled: a replayed notification, not an error.
    console.warn(`[yoco:webhook] order ${order.reference} was already settled, ignoring replay`);
    return ok();
  }

  console.info(`[yoco:webhook] order ${order.reference} paid`);

  // Email must never decide whether a payment counts.
  try {
    const paid = await getOrder(order.id);
    if (paid) await sendOrderEmails(paid);
  } catch (e) {
    console.error(`[yoco:webhook] order ${order.reference} paid but email failed`, e);
  }

  return ok();
}
