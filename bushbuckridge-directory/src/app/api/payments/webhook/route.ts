import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Paystack sends webhook events for payment status changes
export async function POST(request: NextRequest) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify webhook signature
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    const hash = crypto
      .createHmac('sha512', paystackKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // We primarily handle charge.success
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data

      // The verify endpoint already handles the activation logic
      // This webhook serves as a fallback if the redirect doesn't fire
      const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payments/verify?reference=${reference}`

      await fetch(verifyUrl)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
