import { createClient } from '@/utils/pocketbase/server'
import { createServiceClient } from '@/utils/pocketbase/service'
import { NextRequest, NextResponse } from 'next/server'
import { createYocoCheckout } from '@/lib/yoco'
import { getYocoConfig, getPricing } from '@/lib/settings'

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

    if (!business_id || !tier) {
      return NextResponse.json({ error: 'Invalid business_id or tier' }, { status: 400 })
    }

    let business: any = null
    try {
      business = await pb.collection('businesses').getFirstListItem(
        `id = "${business_id}" && owner = "${user.id}"`
      )
    } catch {
      return NextResponse.json({ error: 'Business not found or not authorized' }, { status: 403 })
    }

    const pricing = await getPricing()
    const amountCents = pricing[tier]
    if (!amountCents) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const svc = await createServiceClient()

    const subscription = await svc.collection('subscriptions').create({
      business: business_id,
      tier,
      status: 'pending',
      amount_cents: amountCents,
    })

    const payment = await svc.collection('payments').create({
      business: business_id,
      subscription: subscription.id,
      amount_cents: amountCents,
      provider: 'yoco',
      status: 'pending',
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} listing for ${business.name}`,
    })

    const config = await getYocoConfig()
    if (!config.secretKey) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const checkout = await createYocoCheckout(config.secretKey, {
      amountCents,
      currency: 'ZAR',
      successUrl: `${siteUrl}/api/payments/return?payment_id=${payment.id}&status=success`,
      cancelUrl: `${siteUrl}/portal?payment=cancelled`,
      failureUrl: `${siteUrl}/api/payments/return?payment_id=${payment.id}&status=failed`,
      externalId: payment.id,
      metadata: {
        payment_id: payment.id,
        business_id,
        subscription_id: subscription.id,
        tier,
      },
    })

    // Save the Yoco checkout id so the webhook can still locate this payment
    // even if Yoco's webhook payload omits metadata.
    try {
      await svc.collection('payments').update(payment.id, {
        provider_reference: checkout.id,
      })
    } catch {}

    return NextResponse.json({
      payment_id: payment.id,
      subscription_id: subscription.id,
      redirect_url: checkout.redirectUrl,
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}