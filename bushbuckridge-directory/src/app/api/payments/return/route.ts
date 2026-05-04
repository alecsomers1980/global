import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get('m_payment_id')
  const status = searchParams.get('status') // not always present from PayFast

  if (!paymentId) {
    return NextResponse.redirect(
      new URL('/buy-your-spot?payment=error', request.url)
    )
  }

  try {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    const pb = new PocketBase(pbUrl)

    let payment: any = null
    try {
      payment = await pb.collection('payments').getOne(paymentId)
    } catch {
      return NextResponse.redirect(
        new URL('/buy-your-spot?payment=error', request.url)
      )
    }

    if (payment.status === 'successful') {
      // Check if this was a setup payment (new signup) or upgrade
      // Setup payments have custom_str1 set to business_id via the notify route
      return NextResponse.redirect(
        new URL('/portal?payment=success', request.url)
      )
    } else if (payment.status === 'failed') {
      return NextResponse.redirect(
        new URL('/buy-your-spot?payment=failed', request.url)
      )
    } else {
      // Still pending — ITN may not have arrived yet, show pending page
      return NextResponse.redirect(
        new URL('/portal?payment=pending', request.url)
      )
    }
  } catch (error) {
    console.error('Return handler error:', error)
    return NextResponse.redirect(
      new URL('/buy-your-spot?payment=error', request.url)
    )
  }
}
