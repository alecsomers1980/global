import { createClient } from '@/utils/pocketbase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(new URL('/portal?payment=error&msg=no_reference', request.url))
  }

  try {
    const pb = await createClient()

    // Find the payment by provider reference
    let payment: any = null
    try {
      payment = await pb.collection('payments').getFirstListItem(`provider_reference = "${reference}"`, {
        expand: 'subscription',
      })
    } catch (e) {
      console.error('Payment not found', e)
      return NextResponse.redirect(new URL('/portal?payment=error&msg=not_found', request.url))
    }

    // Verify with Paystack
    const paystackKey = process.env.PAYSTACK_SECRET_KEY

    if (paystackKey && !process.env.NEXT_PUBLIC_DEV_MODE) {
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${paystackKey}`,
        },
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.status && verifyData.data.status === 'success') {
        // Payment successful — update records
        const now = new Date()
        const expiresAt = addMonths(now, 12)

        // Update payment
        await pb.collection('payments').update(payment.id, {
          status: 'successful',
          paid_at: now.toISOString(),
          provider_metadata: verifyData.data,
        })

        // Activate subscription
        await pb.collection('subscriptions').update(payment.subscription, {
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })

        // Update business tier
        await pb.collection('businesses').update(payment.business, {
          package_tier: payment.expand?.subscription?.tier || 'basic',
          status: 'active',
        })

        return NextResponse.redirect(new URL('/portal?payment=success', request.url))
      } else {
        // Payment failed
        await pb.collection('payments').update(payment.id, { 
          status: 'failed', 
          provider_metadata: verifyData.data 
        })

        await pb.collection('subscriptions').update(payment.subscription, { 
          status: 'cancelled' 
        })

        return NextResponse.redirect(new URL('/portal?payment=failed', request.url))
      }
    }

    // Dev mode fallback or no key — auto-approve
    const now = new Date()
    const expiresAt = addMonths(now, 12)

    await pb.collection('payments').update(payment.id, { status: 'successful', paid_at: now.toISOString() })
    await pb.collection('subscriptions').update(payment.subscription, { 
      status: 'active', 
      starts_at: now.toISOString(), 
      expires_at: expiresAt.toISOString() 
    })
    await pb.collection('businesses').update(payment.business, { 
      package_tier: payment.expand?.subscription?.tier || 'basic', 
      status: 'active' 
    })

    return NextResponse.redirect(new URL('/portal?payment=success', request.url))
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(new URL('/portal?payment=error&msg=server_error', request.url))
  }
}
