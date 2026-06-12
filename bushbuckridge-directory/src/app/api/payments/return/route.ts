import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/pocketbase/service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.redirect(
      new URL('/buy-your-spot?payment=error', request.url)
    )
  }

  try {
    const pb = await createServiceClient()

    let payment: any = null
    try {
      payment = await pb.collection('payments').getOne(paymentId)
    } catch {
      return NextResponse.redirect(
        new URL('/buy-your-spot?payment=error', request.url)
      )
    }

    if (payment.status === 'successful') {
      return NextResponse.redirect(
        new URL('/portal?payment=success', request.url)
      )
    } else if (payment.status === 'failed') {
      return NextResponse.redirect(
        new URL('/buy-your-spot?payment=failed', request.url)
      )
    } else {
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