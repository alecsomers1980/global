import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Where PayFast sends the shopper back to after paying. Cosmetic only — the
 * real payment state is decided by the ITN handler. We just resolve an order id
 * and hand off to the success page.
 */
async function handle(req: NextRequest) {
  const url = new URL(req.url);
  let orderId = url.searchParams.get("orderId");

  if (!orderId && req.method === "POST") {
    try {
      const form = await req.formData();
      orderId = (form.get("m_payment_id") as string) || null;
    } catch {
      // no form body — fall through to the cookie
    }
  }
  if (!orderId) {
    orderId = req.cookies.get("pending_order_id")?.value ?? null;
  }

  const dest = new URL("/checkout/success", url.origin);
  if (orderId) dest.searchParams.set("orderId", orderId);

  const res = NextResponse.redirect(dest, { status: 303 });
  res.cookies.delete("pending_order_id");
  return res;
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
