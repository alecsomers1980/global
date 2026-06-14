import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/pocketbase/service'
import { sendMonthlyInsightsEmail } from '@/lib/email'

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const monthLabel = now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' })
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().replace('T', ' ')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let svc
  try {
    svc = await createServiceClient()
  } catch (e) {
    console.error('[cron/monthly-insights] service auth failed:', e)
    return NextResponse.json({ error: 'Service auth failed' }, { status: 500 })
  }

  let businesses: any[] = []
  try {
    businesses = await svc.collection('businesses').getFullList({
      filter: 'package_tier = "pro-business" && status = "active"',
      sort: 'name',
    })
  } catch (e) {
    console.error('[cron/monthly-insights] failed to fetch businesses:', e)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }

  let sent = 0
  for (const b of businesses) {
    if (!b.email) continue
    const stats = { views: 0, website: 0, whatsapp: 0, phone: 0 }
    try {
      const events = await svc.collection('analytics_events').getFullList({
        filter: `business = "${b.id}" && created >= "${thirtyDaysAgo}"`,
      })
      events.forEach((e: any) => {
        if (e.event_type === 'profile_view') stats.views++
        if (e.event_type === 'website_click') stats.website++
        if (e.event_type === 'whatsapp_click') stats.whatsapp++
        if (e.event_type === 'phone_click') stats.phone++
      })
    } catch (e) {
      console.error(`[cron/monthly-insights] analytics fetch failed for ${b.id}:`, e)
    }

    const ok = await sendMonthlyInsightsEmail({
      to: b.email,
      businessName: b.name,
      monthLabel,
      stats,
      portalUrl: `${siteUrl}/portal`,
    })
    if (ok) sent++
  }

  return NextResponse.json({ ok: true, total: businesses.length, sent })
}
