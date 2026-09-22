import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// PayFast configuration — set these in .env.local
// PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE
// Use '10000100' for sandbox merchant ID during testing

const PAYFAST_URL = process.env.PAYFAST_MERCHANT_ID === '10000100'
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, item_name, buyer_name, buyer_email, booking_id } = body;

  const merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';

  const paymentData: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${request.nextUrl.origin}/events/booking/confirmation?booking=${booking_id}&status=success`,
    cancel_url: `${request.nextUrl.origin}/events/booking/confirmation?booking=${booking_id}&status=cancelled`,
    notify_url: `${request.nextUrl.origin}/api/payfast/itn`,
    name_first: buyer_name.split(' ')[0] || buyer_name,
    name_last: buyer_name.split(' ').slice(1).join(' ') || buyer_name,
    email_address: buyer_email,
    m_payment_id: booking_id,
    amount: (parseFloat(amount) || 0).toFixed(2),
    item_name: item_name || 'Event Ticket',
    item_description: `Booking #${booking_id}`,
    custom_str1: booking_id,
  };

  // Generate PayFast signature
  let pfOutput = '';
  const keys = Object.keys(paymentData).sort();
  keys.forEach(key => {
    if (key !== 'signature' && paymentData[key] !== '') {
      pfOutput += `${key}=${encodeURIComponent(paymentData[key]).replace(/%20/g, '+')}&`;
    }
  });
  pfOutput = pfOutput.slice(0, -1); // remove trailing &

  let signature: string;
  if (passphrase) {
    signature = crypto.createHash('md5').update(pfOutput + `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`).digest('hex');
  } else {
    signature = crypto.createHash('md5').update(pfOutput).digest('hex');
  }

  paymentData.signature = signature;

  return NextResponse.json({ paymentUrl: PAYFAST_URL, paymentData });
}
