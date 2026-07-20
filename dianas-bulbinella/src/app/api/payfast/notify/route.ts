import { NextResponse, type NextRequest } from "next/server";
import { payfast } from "@/lib/payfast";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaidOrderEmails } from "@/lib/email/send";

export const runtime = "nodejs";

/**
 * PayFast ITN (Instant Payment Notification).
 *
 * An order is only marked paid after ALL of:
 *   1. the signature verifies,
 *   2. the request came from a PayFast host,
 *   3. PayFast itself confirms the payload via server-to-server postback,
 *   4. the amount actually paid matches the order total we stored.
 *
 * (The aloe-signs original checked only #1 — do not weaken this.)
 *
 * Always returns 200 to PayFast once the payload is genuine: a non-200 makes
 * PayFast retry, which we only want for transient/unknown failures.
 */
export async function POST(req: NextRequest) {
  try {
    // Read the raw body once — needed verbatim for the postback in step 3.
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    const signature = data.signature;
    delete data.signature;

    // 1. Signature
    if (!signature || !payfast.verifySignature(data, signature)) {
      console.error("[payfast.notify] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Source host
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip");
    if (payfast.mode === "production" && !(await payfast.isValidRequestIp(ip))) {
      console.error("[payfast.notify] request from non-PayFast host", ip);
      return NextResponse.json({ error: "Invalid source" }, { status: 403 });
    }

    // 3. Server-to-server confirmation
    if (!(await payfast.validateWithPayFast(rawBody))) {
      console.error("[payfast.notify] postback validation failed");
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const orderId = data.m_payment_id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing m_payment_id" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order, error: loadErr } = await admin
      .from("orders")
      .select("id, status, total, order_number")
      .eq("id", orderId)
      .single();

    if (loadErr || !order) {
      console.error("[payfast.notify] order not found", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotent: PayFast retries, and we must not double-process.
    if (order.status !== "received" && order.status !== "cancelled") {
      return NextResponse.json({ success: true, note: "already processed" });
    }

    const paymentStatus = (data.payment_status || "").toUpperCase();

    if (paymentStatus === "COMPLETE") {
      // 4. Amount actually paid must match what we stored.
      const grossPaid = Number(data.amount_gross ?? 0);
      const expected = Number(order.total);
      if (Math.abs(grossPaid - expected) > 0.01) {
        console.error(
          `[payfast.notify] amount mismatch on ${order.order_number}: paid ${grossPaid} vs expected ${expected}`
        );
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      const { error: updErr } = await admin
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_id: data.pf_payment_id ?? null,
          payment_data: data,
        })
        .eq("id", order.id);
      if (updErr) throw updErr;

      console.log(`[payfast.notify] order ${order.order_number} paid`);

      // Best-effort — sendPaidOrderEmails swallows its own errors so a Resend
      // outage can't turn a successful payment into a PayFast retry.
      await sendPaidOrderEmails(order.id);
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      const { error: updErr } = await admin
        .from("orders")
        .update({ status: "cancelled", payment_data: data })
        .eq("id", order.id);
      if (updErr) throw updErr;
      console.log(
        `[payfast.notify] order ${order.order_number} ${paymentStatus.toLowerCase()}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[payfast.notify]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
