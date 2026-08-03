import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getOrderById, markOrderStatus, type OrderStatus } from '@/lib/db';
import { sendOrderStatusEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { orderId, status } = body;

    if (typeof orderId !== 'string' || typeof status !== 'string') {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const allowed = [
      'pending',
      'paid',
      'cancelled',
      'failed',
      'printing',
      'shipped',
      'completed',
    ] as const;
    if (!allowed.includes(status as OrderStatus)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    const nextStatus = status as OrderStatus;

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status !== nextStatus) {
      await markOrderStatus(orderId, nextStatus);
      if (order.customer_email) {
        // best-effort: email is wrapped internally, never throws
        await sendOrderStatusEmail({ ...order, status: nextStatus }, nextStatus);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/orders/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}