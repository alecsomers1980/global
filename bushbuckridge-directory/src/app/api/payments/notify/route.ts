import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { verifyPayFastSignature, validatePayFastItn } from '@/lib/payfast'
import { sendPaymentReceipt, sendWelcomeEmail, sendAdminSignupAlert } from '@/lib/email'
import { addMonths } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const data: Record<string, string> = {}
    params.forEach((value, key) => {
      data[key] = value
    })

    const payfastKey = process.env.PAYFAST_MERCHANT_KEY
    const passphrase = process.env.PAYFAST_PASSPHRASE

    if (!payfastKey) {
      console.error('PayFast ITN: merchant key not configured')
      return new NextResponse(null, { status: 500 })
    }

    // Step 1: Verify the signature
    if (!verifyPayFastSignature(data, passphrase)) {
      console.error('PayFast ITN: invalid signature')
      return new NextResponse(null, { status: 401 })
    }

    // Step 2: Validate with PayFast
    const isValid = await validatePayFastItn(data)
    if (!isValid) {
      console.error('PayFast ITN: validation failed')
      return new NextResponse(null, { status: 400 })
    }

    // Step 3: Check essential fields
    const paymentId = data.m_payment_id
    const paymentStatus = data.payment_status
    const pfPaymentId = data.pf_payment_id
    const amountGross = parseFloat(data.amount_gross || '0')
    const businessId = data.custom_str1
    const subscriptionId = data.custom_str2
    const merchantId = data.merchant_id

    if (merchantId !== process.env.PAYFAST_MERCHANT_ID) {
      console.error('PayFast ITN: merchant ID mismatch')
      return new NextResponse(null, { status: 400 })
    }

    if (!paymentId || !businessId) {
      console.error('PayFast ITN: missing payment_id or business_id')
      return new NextResponse(null, { status: 400 })
    }

    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    const pb = new PocketBase(pbUrl)

    // Look up the payment
    let payment: any = null
    try {
      payment = await pb.collection('payments').getOne(paymentId)
    } catch (e) {
      console.error('PayFast ITN: payment not found', paymentId)
      return new NextResponse(null, { status: 404 })
    }

    // Skip if already processed
    if (payment.status === 'successful') {
      return new NextResponse(null, { status: 200 })
    }

    if (paymentStatus === 'COMPLETE') {
      const expectedZar = payment.amount_cents / 100
      if (Math.abs(amountGross - expectedZar) > expectedZar * 0.05) {
        console.error(
          `PayFast ITN: amount mismatch — expected ${expectedZar}, got ${amountGross}`
        )
      }

      // Fetch business BEFORE activation to check if this is a new signup
      let businessBefore: any = null
      try {
        businessBefore = await pb.collection('businesses').getOne(businessId)
      } catch (e) {
        // ignore
      }

      const isNewSignup = businessBefore?.status === 'pending'

      const now = new Date()
      const expiresAt = addMonths(now, 12)

      // Update payment
      await pb.collection('payments').update(paymentId, {
        status: 'successful',
        paid_at: now.toISOString(),
        provider_reference: pfPaymentId,
        provider_metadata: data,
      })

      // Activate subscription
      if (subscriptionId) {
        try {
          await pb.collection('subscriptions').update(subscriptionId, {
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
        } catch (e) {
          console.error('PayFast ITN: could not update subscription', subscriptionId, e)
        }
      }

      // Activate business
      let business: any = null
      try {
        business = await pb.collection('businesses').update(businessId, {
          status: 'active',
        })
      } catch (e) {
        console.error('PayFast ITN: could not update business', businessId, e)
      }

      // Send emails
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const amountZar = `R${(payment.amount_cents / 100).toFixed(2)}`
      const tier = business?.package_tier || data.custom_str3 || 'basic'

      if (business?.email) {
        // Payment receipt
        await sendPaymentReceipt({
          to: business.email,
          businessName: business.name,
          tier,
          amount: amountZar,
          paymentRef: pfPaymentId,
          portalUrl: `${siteUrl}/portal`,
        })

        // Welcome email for new signups
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

      // Admin notification
      await sendAdminSignupAlert({
        businessName: business?.name || 'Unknown',
        contactName: businessBefore?.contact_person || business?.email || 'Unknown',
        email: business?.email || 'Unknown',
        phone: business?.phone || '',
        tier,
        sector: businessBefore?.sector || '',
        area: businessBefore?.area || '',
        adminUrl: `${siteUrl}/admin/businesses`,
      })
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      await pb.collection('payments').update(paymentId, {
        status: 'failed',
        provider_reference: pfPaymentId,
        provider_metadata: data,
      })

      if (subscriptionId) {
        try {
          await pb.collection('subscriptions').update(subscriptionId, {
            status: 'cancelled',
          })
        } catch (e) {
          // ignore
        }
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('PayFast ITN error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
