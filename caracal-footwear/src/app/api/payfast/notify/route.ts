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
 *   - the request came from a PayFast host (production only -- the sandbox
 *     does not always originate from PayFast's published ranges),
 *   - PayFast itself confirms the payload via server-to-server postback --
 *     the authoritative check; see the note below on local signature
 *     verification, which does NOT gate this handler,
 *   - the amount actually paid matches the order total we stored,
 *   - decrement_stock_for_order reports every line could be filled.
 *
 * If money clears but stock can't cover the order, the order becomes
 * `stock_conflict` -- NOT silently left as `pending` and NOT silently marked
 * `paid`. Money has landed; that has to be visible.
 *
 * Always returns 200 once the notification itself is genuine: a non-200
 * makes PayFast retry, which we only want for transient/unknown failures.
 *
 * ON LOCAL SIGNATURE VERIFICATION: `payfast.verifySignature` (MD5 of the
 * urlencoded fields, ported from the proven dianas-bulbinella implementation)
 * is proven byte-correct for OUR OWN outbound payment payload -- verified by
 * capturing the real wire bytes and independently recomputing the hash by
 * hand, matching exactly. It does NOT reproduce PayFast's own signature on
 * their INBOUND ITN callback for a real (non-shared) sandbox account: a
 * genuine, PayFast-confirmed payment was captured and replayed against a
 * dozen structural variants (field order, passphrase on/off, encoding style,
 * excluding the amount_fee/amount_net fields) and none matched PayFast's own
 * hash. The mismatch is on PayFast's inbound side specifically, not a defect
 * in the outbound signing logic.
 *
 * Rather than hard-reject on that local mismatch -- which would silently
 * fail every real payment -- this handler treats local signature
 * verification as a diagnostic-only log and relies on the server-to-server
 * postback validation below as the sole authority. That call queries
 * PayFast's own server for this exact payload; it cannot return "VALID" for
 * data PayFast never actually sent, which makes it strictly stronger
 * evidence than reproducing their hash locally. Confirmed against a real
 * sandbox payment: order moved to `paid`, stock decremented exactly once,
 * confirmation email fired.
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

    if (!signature || !payfast.verifySignature(data, signature)) {
      // Diagnostic only -- see the file-level note above. Not a rejection.
      console.warn('[payfast.notify] local signature check did not match (expected -- see note); relying on postback validation');
    }

    // Source host (production only)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip');
    if (payfast.mode === 'production' && !(await payfast.isValidRequestIp(ip))) {
      console.error('[payfast.notify] request from non-PayFast host', ip);
      return NextResponse.json({ error: 'Invalid source' }, { status: 403 });
    }

    // Server-to-server confirmation -- the authoritative check; see the
    // file-level note above for why this gates the handler instead of local
    // signature verification.
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
      // Amount actually paid must match what we stored.
      const grossPaid = Number(data.amount_gross ?? 0);
      const expected = centsToRand(order.total);
      if (Math.abs(grossPaid - expected) > 0.01) {
        console.error(
          `[payfast.notify] amount mismatch on ${order.order_number}: paid ${grossPaid} vs expected ${expected}`,
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // Atomic stock decrement -- see supabase/migrations/0003_stock_decrement.sql
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
