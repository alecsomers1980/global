import { payfast } from '@/lib/payfast';
import { markOrderPaid, markOrderStatus } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // --- Validate PayFast IP ---
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    if (!payfast.isValidPayFastIP(ip)) {
      console.log(`[PayFast ITN] Invalid IP: ${ip}`);
      return new Response('OK', { status: 200 });
    }

    // --- Parse form-urlencoded data ---
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    // --- Verify signature ---
    if (!payfast.verifySignature(data, data.signature)) {
      console.log('[PayFast ITN] Signature verification failed');
      return new Response('OK', { status: 200 });
    }

    const m_payment_id = data.m_payment_id;
    const pf_payment_id = data.pf_payment_id;
    const payment_status = data.payment_status;

    // --- Update order based on status ---
    if (payment_status === 'COMPLETE') {
      await markOrderPaid(m_payment_id, pf_payment_id);
    } else if (payment_status === 'CANCELLED' || payment_status === 'FAILED') {
      await markOrderStatus(m_payment_id, payment_status.toLowerCase() as any);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    // PayFast expects 200 even on errors
    return new Response('OK', { status: 200 });
  }
}
