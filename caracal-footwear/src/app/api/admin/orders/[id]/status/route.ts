import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * Staff can move an order to `fulfilled` and ONLY `fulfilled`. `paid` and
 * `stock_conflict` are set exclusively by the PayFast ITN handler
 * (src/app/api/payfast/notify/route.ts) -- payment state is never something
 * a human sets by hand, full stop. Rejecting every other target here is the
 * enforcement point; the admin UI only ever offering "Mark fulfilled" is
 * just the friendlier half of that, not the actual guarantee.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as { status?: string };

  if (body.status !== 'fulfilled') {
    return NextResponse.json(
      { error: 'Only "fulfilled" can be set by staff. Payment status is set by PayFast only.' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from('orders').select('status').eq('id', id).single();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Only a paid order can be marked fulfilled -- an order that's still
  // pending, or that never got past stock_conflict, hasn't actually shipped.
  if (order.status !== 'paid') {
    return NextResponse.json(
      { error: `Cannot fulfil an order with status "${order.status}" -- only a paid order can be fulfilled.` },
      { status: 400 },
    );
  }

  const { error } = await admin.from('orders').update({ status: 'fulfilled' }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
