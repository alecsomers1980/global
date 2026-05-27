import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { verifyRenewalToken } from '@/lib/tokens'
import { createYocoCheckout } from '@/lib/yoco'
import { getYocoConfig } from '@/lib/settings'

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic Listing (Annual)',
  'pro-lead': 'Pro Lead Package (Annual)',
  'pro-business': 'Pro Business Listing (Annual)',
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const s = params.get('s') || ''
  const e = params.get('e') || ''
  const t = params.get('t') || ''

  if (!verifyRenewalToken(s, e, t)) {
    return NextResponse.redirect(new URL('/?renew=invalid', request.url))
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

  let subscription: any
  try {
    subscription = await pb.collection('subscriptions').getOne(s)
  } catch {
    return NextResponse.redirect(new URL('/?renew=not_found', request.url))
  }

  let business: any
  try {
    business = await pb.collection('businesses').getOne(subscription.business)
  } catch {
    return NextResponse.redirect(new URL('/?renew=not_found', request.url))
  }

  const config = await getYocoConfig()
  if (!config.secretKey) {
    return NextResponse.redirect(new URL('/?renew=config_error', request.url))
  }

  const tier = subscription.tier
  const amountCents = subscription.amount_cents

  const payment = await pb.collection('payments').create({
    business: business.id,
    subscription: subscription.id,
    amount_cents: amountCents,
    provider: 'yoco',
    status: 'pending',
    description: `Renewal — ${TIER_LABELS[tier] || tier} for ${business.name}`,
  })

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
      business_id: business.id,
      subscription_id: subscription.id,
      tier,
      renewal: 'true',
    },
  })

  try {
    await pb.collection('payments').update(payment.id, {
      provider_reference: checkout.id,
    })
  } catch {}

  return NextResponse.redirect(checkout.redirectUrl)
}
