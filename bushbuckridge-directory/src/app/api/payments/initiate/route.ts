import { createClient } from '@/utils/pocketbase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildPayFastForm, getPayFastProcessUrl } from '@/lib/payfast'

const TIER_PRICES_CENTS: Record<string, number> = {
  basic: 19900,
  'pro-lead': 79900,
  'pro-business': 1050000,
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic Listing (Annual)',
  'pro-lead': 'Pro Lead Package (Annual)',
  'pro-business': 'Pro Business Listing (Annual)',
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

    if (!business_id || !tier || !TIER_PRICES_CENTS[tier]) {
      return NextResponse.json({ error: 'Invalid business_id or tier' }, { status: 400 })
    }

    // Verify user owns this business
    let business: any = null
    try {
      business = await pb.collection('businesses').getFirstListItem(
        `id = "${business_id}" && owner = "${user.id}"`
      )
    } catch {
      return NextResponse.json({ error: 'Business not found or not authorized' }, { status: 403 })
    }

    const amountCents = TIER_PRICES_CENTS[tier]
    const amountZar = (amountCents / 100).toFixed(2)

    // Create subscription record
    const subscription = await pb.collection('subscriptions').create({
      business: business_id,
      tier,
      status: 'pending',
      amount_cents: amountCents,
    })

    // Create payment record
    const payment = await pb.collection('payments').create({
      business: business_id,
      subscription: subscription.id,
      amount_cents: amountCents,
      provider: 'payfast',
      status: 'pending',
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} listing for ${business.name}`,
    })

    const merchantId = process.env.PAYFAST_MERCHANT_ID
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY
    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const formFields = buildPayFastForm({
      merchantId,
      merchantKey,
      returnUrl: `${siteUrl}/api/payments/return`,
      cancelUrl: `${siteUrl}/portal?payment=cancelled`,
      notifyUrl: `${siteUrl}/api/payments/notify`,
      firstName: user.first_name || business.contact_person || '',
      lastName: user.last_name || '',
      email: user.email,
      paymentId: payment.id,
      amount: amountZar,
      itemName: TIER_LABELS[tier] || `${tier} listing`,
      itemDescription: `${business.name} — ${tier} package`,
      customStr1: business_id,
      customStr2: subscription.id,
      customStr3: tier,
      passphrase: process.env.PAYFAST_PASSPHRASE,
    })

    return NextResponse.json({
      payment_id: payment.id,
      subscription_id: subscription.id,
      payfast_url: getPayFastProcessUrl(),
      form_fields: formFields,
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
