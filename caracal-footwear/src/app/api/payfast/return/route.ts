import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * PayFast redirects the CUSTOMER'S BROWSER here after payment -- this is
 * separate from /api/payfast/notify, which is the server-to-server webhook
 * that actually confirms payment. The browser can arrive here before, after,
 * or without the ITN ever landing, so this route only resolves an orderId to
 * an order_number and hands off to the status-aware success page -- it never
 * changes order status itself.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.redirect(new URL('/checkout/cancelled', req.url));
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('order_number')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(new URL('/checkout/cancelled', req.url));
  }

  return NextResponse.redirect(
    new URL(`/checkout/success?order=${order.order_number}`, req.url),
  );
}
