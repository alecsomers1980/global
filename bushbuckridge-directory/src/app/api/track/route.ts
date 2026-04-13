import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/pocketbase/server'

// Lightweight endpoint to track listing views
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business_id } = body

    if (!business_id) {
      return NextResponse.json({ error: 'Missing business_id' }, { status: 400 })
    }

    const pb = await createClient()

    await pb.collection('listing_views').create({
      business: business_id,
      referrer: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json({ tracked: true })
  } catch (error) {
    // Silently fail — analytics should never break user experience
    return NextResponse.json({ tracked: false })
  }
}
