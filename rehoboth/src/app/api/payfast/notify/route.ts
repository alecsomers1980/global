import { NextRequest, NextResponse } from "next/server";
import { payfast } from "@/lib/payfast";
import { getOrder, markOrderPaid, markOrderFailed } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";

/**
 * PayFast Instant Transaction Notification.
 *
 * Everything here is a defence against a forged POST marking an order paid.
 * The checks run in order and all four must pass before any state changes:
 * the request must come from a PayFast host, carry a signature that verifies
 * against our passphrase, survive a server-to-server postback to PayFast, and
 * name an amount that matches what we actually charged.
 *
 * Every exit returns 200. PayFast retries a non-200 for hours, so returning an
 * error to a request we have decided to ignore just buys a retry storm — the
 * rejection is logged instead.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = () => new NextResponse("OK", { status: 200 });

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const orderId = params.get("m_payment_id") ?? "";
  const paymentStatus = params.get("payment_status") ?? "";
  const reject = (why: string) =>
    console.error(`[payfast:itn] rejected (${why}) order=${orderId || "?"}`);

  // 1. Source host.
  const ip = clientIp(req);
  if (!(await payfast.isValidRequestIp(ip))) {
    reject(`ip ${ip ?? "unknown"} is not a PayFast host`);
    return ok();
  }

  // 2. Signature over the payload as received, minus the signature itself.
  //    URLSearchParams preserves POST order, which the signature depends on.
  const signature = params.get("signature") ?? "";
  const signed: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (k !== "signature") signed[k] = v;
  }
  if (!signature || !payfast.verifySignature(signed, signature)) {
    reject("signature mismatch");
    return ok();
  }

  // 3. Ask PayFast whether it really sent this.
  if (!(await payfast.validateWithPayFast(raw))) {
    reject("postback validation did not return VALID");
    return ok();
  }

  const order = await getOrder(orderId);
  if (!order) {
    reject("no such order");
    return ok();
  }

  if (paymentStatus !== "COMPLETE") {
    await markOrderFailed(order.id, paymentStatus === "CANCELLED" ? "cancelled" : "failed");
    console.warn(`[payfast:itn] order ${order.reference} reported ${paymentStatus}`);
    return ok();
  }

  // 4. The amount PayFast collected must be the amount we asked for. Compared
  //    in whole cents — a float comparison here is a rounding bug waiting to
  //    approve an order that came up a cent short.
  const gross = Number(params.get("amount_gross"));
  if (!Number.isFinite(gross) || Math.round(gross * 100) !== Math.round(order.total * 100)) {
    reject(`amount_gross ${params.get("amount_gross")} != order total ${order.total}`);
    return ok();
  }

  const transitioned = await markOrderPaid(order.id, params.get("pf_payment_id") ?? "");
  if (!transitioned) {
    // Already settled: a replayed notification, not an error.
    console.warn(`[payfast:itn] order ${order.reference} was already settled, ignoring replay`);
    return ok();
  }

  console.info(`[payfast:itn] order ${order.reference} paid`);

  // Email must never decide whether a payment counts.
  try {
    const paid = await getOrder(order.id);
    if (paid) await sendOrderEmails(paid);
  } catch (e) {
    console.error(`[payfast:itn] order ${order.reference} paid but email failed`, e);
  }

  return ok();
}
