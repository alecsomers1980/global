import { NextRequest, NextResponse } from "next/server";

/**
 * Where PayFast sends the customer's browser after payment.
 *
 * This route decides nothing. It cannot: anyone can open this URL with any
 * orderId. Whether an order is actually paid is settled only by the ITN, which
 * is verified server-to-server — this just moves the customer to a page that
 * reads the order's real state.
 *
 * PayFast has been known to use either verb here, so both are handled.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirect(req: NextRequest, orderId: string | null) {
  const url = new URL("/checkout/success", req.nextUrl.origin);
  if (orderId) url.searchParams.set("order", orderId);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  return redirect(req, req.nextUrl.searchParams.get("orderId"));
}

export async function POST(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  return redirect(req, orderId);
}
