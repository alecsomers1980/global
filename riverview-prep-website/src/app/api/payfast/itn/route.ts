import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const data: Record<string, string> = {};
  params.forEach((value, key) => { data[key] = value; });

  const bookingId = data.m_payment_id || data.custom_str1;
  const paymentStatus = data.payment_status;
  const pfPaymentId = data.pf_payment_id;

  // Verify signature
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  let pfOutput = '';
  const keys = Object.keys(data).filter(k => k !== 'signature').sort();
  keys.forEach(key => {
    if (data[key] !== '') {
      pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
    }
  });
  pfOutput = pfOutput.slice(0, -1);

  let expectedSig: string;
  if (passphrase) {
    expectedSig = crypto.createHash('md5').update(pfOutput + `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`).digest('hex');
  } else {
    expectedSig = crypto.createHash('md5').update(pfOutput).digest('hex');
  }

  if (data.signature !== expectedSig) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Update booking in database
  if (bookingId && pfPaymentId) {
    const supabase = await createServerSupabase();
    await supabase.from('event_bookings').update({
      payfast_payment_id: pfPaymentId,
      payfast_status: paymentStatus,
      status: paymentStatus === 'COMPLETE' ? 'paid' : 'cancelled',
    }).eq('id', bookingId);
  }

  return new NextResponse('OK');
}
