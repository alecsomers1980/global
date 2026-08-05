import { NextResponse, type NextRequest } from 'next/server';
import { payfast } from '@/lib/payfast';
import { createAdminClient } from '@/lib/supabase/admin';
import { centsToRand } from '@/lib/money';
import { sendPaidOrderEmails, sendStockConflictEmails } from '@/lib/email/send';

export const runtime = 'nodejs';

/**
 * PayFast ITN (Instant Payment Notification).
 *
 * An order only becomes `paid` after ALL of:
 *   1. the signature verifies,
 *   2. the request came from a PayFast host (production only -- the sandbox
 *      does not always originate from PayFast's published ranges),
 *   3. PayFast itself confirms the payload via server-to-server postback,
 *   4. the amount actually paid matches the order total we stored,
 *   5. decrement_stock_for_order reports every line could be filled.
 *
 * If money clears (1-4 pass) but stock can't cover the order (5 fails), the
 * order becomes `stock_conflict` -- NOT silently left as `pending` and NOT
 * silently marked `paid`. Money has landed; that has to be visible.
 *
 * Always returns 200 once the notification itself is genuine: a non-200
 * makes PayFast retry, which we only want for transient/unknown failures.
 */
export async function POST(req: NextRequest) {
  try {
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
      console.error('[payfast.notify] invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Source host (production only)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip');
    if (payfast.mode === 'production' && !(await payfast.isValidRequestIp(ip))) {
      console.error('[payfast.notify] request from non-PayFast host', ip);
      return NextResponse.json({ error: 'Invalid source' }, { status: 403 });
    }

    // 3. Server-to-server confirmation
    if (!(await payfast.validateWithPayFast(rawBody))) {
      console.error('[payfast.notify] postback validation failed');
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const orderId = data.m_payment_id;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing m_payment_id' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order, error: loadErr } = await admin
      .from('orders')
      .select('id, status, total, order_number')
      .eq('id', orderId)
      .single();

    if (loadErr || !order) {
      console.error('[payfast.notify] order not found', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotent: PayFast retries notifications. Only a `pending` order can
    // still be transitioned -- every other status has already been decided.
    if (order.status !== 'pending') {
      return NextResponse.json({ success: true, note: 'already processed' });
    }

    const paymentStatus = (data.payment_status || '').toUpperCase();

    if (paymentStatus === 'COMPLETE') {
      // 4. Amount actually paid must match what we stored.
      const grossPaid = Number(data.amount_gross ?? 0);
      const expected = centsToRand(order.total);
      if (Math.abs(grossPaid - expected) > 0.01) {
        console.error(
          `[payfast.notify] amount mismatch on ${order.order_number}: paid ${grossPaid} vs expected ${expected}`,
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // 5. Atomic stock decrement -- see supabase/migrations/0003_stock_decrement.sql
      const { data: stockResult, error: stockErr } = await admin
        .rpc('decrement_stock_for_order', { p_order_id: order.id })
        .single();
      if (stockErr) throw stockErr;

      if (stockResult && (stockResult as { ok: boolean }).ok) {
        const { error: updErr } = await admin
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payfast_payment_id: data.pf_payment_id ?? null,
            payment_data: data,
          })
          .eq('id', order.id);
        if (updErr) throw updErr;

        console.log(`[payfast.notify] order ${order.order_number} paid`);
        await sendPaidOrderEmails(order.id);
      } else {
        const { error: updErr } = await admin
          .from('orders')
          .update({
            status: 'stock_conflict',
            paid_at: new Date().toISOString(),
            payfast_payment_id: data.pf_payment_id ?? null,
            payment_data: data,
          })
          .eq('id', order.id);
        if (updErr) throw updErr;

        console.error(`[payfast.notify] order ${order.order_number} paid but stock conflict`, stockResult);
        await sendStockConflictEmails(order.id);
      }
    } else if (paymentStatus === 'FAILED') {
      const { error: updErr } = await admin
        .from('orders')
        .update({ status: 'failed', payment_data: data })
        .eq('id', order.id);
      if (updErr) throw updErr;
      console.log(`[payfast.notify] order ${order.order_number} failed`);
    } else if (paymentStatus === 'CANCELLED') {
      const { error: updErr } = await admin
        .from('orders')
        .update({ status: 'cancelled', payment_data: data })
        .eq('id', order.id);
      if (updErr) throw updErr;
      console.log(`[payfast.notify] order ${order.order_number} cancelled`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[payfast.notify]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
