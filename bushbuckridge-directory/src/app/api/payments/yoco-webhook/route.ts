import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { verifyYocoWebhook } from '@/lib/yoco'
import { getYocoConfig } from '@/lib/settings'
import {
  sendPaymentReceipt,
  sendWelcomeEmail,
  sendAdminSignupAlert,
} from '@/lib/email'
import { addMonths } from 'date-fns'

// Try several locations because the exact Yoco webhook payload shape isn't
// fully documented — our reconciliation key (payment.id) may be in metadata,
// externalId, or nested under a payment object.
function extractOurPaymentId(payload: any): string | null {
  return (
    payload?.metadata?.payment_id ||
    payload?.externalId ||
    payload?.payment?.metadata?.payment_id ||
    payload?.payment?.externalId ||
    payload?.data?.metadata?.payment_id ||
    payload?.data?.externalId ||
    null
  )
}

function extractMetadata(payload: any): Record<string, string> {
  return (
    payload?.metadata ||
    payload?.payment?.metadata ||
    payload?.data?.metadata ||
    {}
  )
}

function extractYocoPaymentId(payload: any): string | null {
  return (
    payload?.payment_id ||
    payload?.payment?.id ||
    payload?.id ||
    payload?.data?.id ||
    null
  )
}

function isSuccessEvent(eventType: string, payload: any): boolean {
  if (!eventType) return false
  const t = eventType.toLowerCase()
  if (t === 'payment.succeeded' || t === 'payment.created') {
    const status = (payload?.status || payload?.payment?.status || '').toLowerCase()
    if (!status) return true
    return status === 'successful' || status === 'succeeded' || status === 'paid'
  }
  return false
}

function isFailureEvent(eventType: string): boolean {
  if (!eventType) return false
  const t = eventType.toLowerCase()
  return (
    t === 'payment.failed' ||
    t === 'payment.cancelled' ||
    t === 'checkout.cancelled' ||
    t === 'checkout.failed'
  )
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    const config = await getYocoConfig()
    if (!config.webhookSecret) {
      console.error('Yoco webhook: YOCO_WEBHOOK_SECRET not configured')
      return new NextResponse(null, { status: 500 })
    }

    const webhookId = request.headers.get('webhook-id') || ''
    const webhookTimestamp = request.headers.get('webhook-timestamp') || ''
    const webhookSignature = request.headers.get('webhook-signature') || ''

    const valid = verifyYocoWebhook({
      secret: config.webhookSecret,
      webhookId,
      webhookTimestamp,
      webhookSignature,
      rawBody,
    })

    if (!valid) {
      console.error('Yoco webhook: invalid signature')
      return new NextResponse(null, { status: 401 })
    }

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return new NextResponse(null, { status: 400 })
    }

    const eventType: string = payload?.type || payload?.event_type || ''
    const ourPaymentId = extractOurPaymentId(payload)
    const yocoPaymentId = extractYocoPaymentId(payload)

    if (!ourPaymentId) {
      console.error('Yoco webhook: could not extract our payment_id from payload', {
        eventType,
        payloadKeys: Object.keys(payload || {}),
      })
      return new NextResponse(null, { status: 200 })
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

    let payment: any = null
    try {
      payment = await pb.collection('payments').getOne(ourPaymentId)
    } catch {
      console.error('Yoco webhook: payment not found', ourPaymentId)
      return new NextResponse(null, { status: 404 })
    }

    if (payment.status === 'successful') {
      return new NextResponse(null, { status: 200 })
    }

    if (isSuccessEvent(eventType, payload)) {
      const metadata = extractMetadata(payload)
      const businessId = metadata.business_id || payment.business
      const subscriptionId = metadata.subscription_id || payment.subscription
      const tier = metadata.tier || ''

      let businessBefore: any = null
      try {
        businessBefore = await pb.collection('businesses').getOne(businessId)
      } catch {}

      const isNewSignup = businessBefore?.status === 'pending'
      const now = new Date()
      const expiresAt = addMonths(now, 12)

      await pb.collection('payments').update(ourPaymentId, {
        status: 'successful',
        paid_at: now.toISOString(),
        provider_reference: yocoPaymentId || payment.provider_reference,
        provider_metadata: payload,
      })

      if (subscriptionId) {
        try {
          await pb.collection('subscriptions').update(subscriptionId, {
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
        } catch (e) {
          console.error('Yoco webhook: subscription update failed', subscriptionId, e)
        }
      }

      let business: any = null
      try {
        business = await pb.collection('businesses').update(businessId, {
          status: 'active',
        })
      } catch (e) {
        console.error('Yoco webhook: business update failed', businessId, e)
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const amountZar = `R${(payment.amount_cents / 100).toFixed(2)}`
      const resolvedTier = tier || business?.package_tier || 'basic'

      if (business?.email) {
        await sendPaymentReceipt({
          to: business.email,
          businessName: business.name,
          tier: resolvedTier,
          amount: amountZar,
          paymentRef: yocoPaymentId || ourPaymentId,
          portalUrl: `${siteUrl}/portal`,
        })

        if (isNewSignup) {
          await sendWelcomeEmail({
            to: business.email,
            businessName: business.name,
            loginUrl: `${siteUrl}/login`,
            portalUrl: `${siteUrl}/portal`,
            siteUrl,
          })
        }
      }

      await sendAdminSignupAlert({
        businessName: business?.name || 'Unknown',
        contactName: businessBefore?.contact_person || business?.email || 'Unknown',
        email: business?.email || 'Unknown',
        phone: business?.phone || '',
        tier: resolvedTier,
        sector: businessBefore?.sector || '',
        area: businessBefore?.area || '',
        adminUrl: `${siteUrl}/admin/businesses`,
      })
    } else if (isFailureEvent(eventType)) {
      await pb.collection('payments').update(ourPaymentId, {
        status: 'failed',
        provider_reference: yocoPaymentId || payment.provider_reference,
        provider_metadata: payload,
      })

      if (payment.subscription) {
        try {
          await pb.collection('subscriptions').update(payment.subscription, {
            status: 'cancelled',
          })
        } catch {}
      }
    } else {
      console.log('Yoco webhook: unhandled event type', eventType)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Yoco webhook error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
