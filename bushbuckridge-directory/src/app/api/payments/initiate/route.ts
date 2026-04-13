import { createClient } from '@/utils/pocketbase/server'
import { NextRequest, NextResponse } from 'next/server'

// Paystack pricing tiers in ZAR cents
const TIER_PRICING: Record<string, number> = {
  standard: 19900,   // R199.00
  enhanced: 49900,   // R499.00
  premium: 99900,    // R999.00
}

export async function POST(request: NextRequest) {
  try {
    const pb = await createClient()
    const user = pb.authStore.model

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { business_id, tier } = body

    if (!business_id || !tier || !TIER_PRICING[tier]) {
      return NextResponse.json({ error: 'Invalid business_id or tier' }, { status: 400 })
    }

    // Verify user owns this business
    let business: any = null
    try {
      business = await pb.collection('businesses').getFirstListItem(`id = "${business_id}" && owner = "${user.id}"`)
    } catch (e) {
      return NextResponse.json({ error: 'Business not found or not authorized' }, { status: 403 })
    }

    const amount = TIER_PRICING[tier]

    // Create subscription record
    let subscription: any = null
    try {
      subscription = await pb.collection('subscriptions').create({
        business: business_id,
        tier,
        status: 'pending',
        amount_cents: amount,
      })
    } catch (e) {
      console.error('Subscription creation error:', e)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Create payment record
    let payment: any = null
    try {
      payment = await pb.collection('payments').create({
        business: business_id,
        subscription: subscription.id,
        amount_cents: amount,
        provider: 'paystack',
        status: 'pending',
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} listing for ${business.name}`,
      })
    } catch (e) {
      console.error('Payment creation error:', e)
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    // Initialize Paystack transaction
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) {
      // If no Paystack key, return mock data for development
      return NextResponse.json({
        payment_id: payment.id,
        subscription_id: subscription.id,
        authorization_url: `/portal?payment=mock&status=success`,
        reference: `mock_${payment.id}`,
        message: 'Development mode — Paystack key not configured',
      })
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount, // Paystack expects amount in kobo/cents
        currency: 'ZAR',
        reference: `bbdir_${payment.id}`,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payments/verify?reference=bbdir_${payment.id}`,
        metadata: {
          payment_id: payment.id,
          subscription_id: subscription.id,
          business_id,
          tier,
          business_name: business.name,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData)
      return NextResponse.json({ error: 'Payment provider error' }, { status: 500 })
    }

    // Update payment with provider reference
    await pb.collection('payments').update(payment.id, {
      provider_reference: paystackData.data.reference,
      provider_metadata: paystackData.data,
    })

    return NextResponse.json({
      payment_id: payment.id,
      subscription_id: subscription.id,
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
