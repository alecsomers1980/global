import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/storage";
import { sendFulfilmentEmail } from "@/lib/email/send";
import { isPaid, FULFILMENT_STEPS, type OrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * Move an order through fulfilment, and email the customer when it ships or is
 * collected. This runs server-side purely so the email can be sent — the DB
 * write itself would be allowed by the "staff update orders" RLS policy too.
 *
 * Deliberately narrow: only the FULFILMENT_STEPS are settable here. 'paid' is
 * owned by the PayFast ITN and must never be set by hand.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const next = body.status as OrderStatus;

    if (!FULFILMENT_STEPS.includes(next)) {
      return NextResponse.json(
        { error: "That status can't be set here." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, status, fulfilled_at")
      .eq("id", id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!isPaid(order.status as OrderStatus)) {
      return NextResponse.json(
        { error: "This order hasn't been paid yet." },
        { status: 409 }
      );
    }

    // Stamp fulfilment ONLY the first time. The review-request cron counts N
    // days from here, so re-stamping on a shipped -> collected correction would
    // restart the customer's clock.
    const isFulfilment = next === "shipped" || next === "collected";
    const stampFulfilment = isFulfilment && !order.fulfilled_at;
    const { error } = await admin
      .from("orders")
      .update({
        status: next,
        ...(stampFulfilment ? { fulfilled_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) throw error;

    if (next === "shipped" || next === "collected") {
      await sendFulfilmentEmail(id, next);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.orders.status]", error);
    return NextResponse.json(
      { error: error?.message || "Could not update the order." },
      { status: 500 }
    );
  }
}
