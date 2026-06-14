import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { sendSpotlightReminderEmail } from '@/lib/email'

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
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const quarter = month <= 3 ? 'Q1' : month <= 6 ? 'Q2' : month <= 9 ? 'Q3' : 'Q4'

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let businesses: any[] = []
  try {
    businesses = await pb
      .collection('businesses')
      .getFullList({ filter: 'package_tier = "pro-business"', sort: 'name' })
  } catch (e) {
    console.error('[cron/spotlight-reminder] Failed to fetch businesses:', e)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }

  let articles: any[] = []
  try {
    articles = await pb
      .collection('spotlight_articles')
      .getFullList({ filter: `year = ${year} && quarter = "${quarter}"` })
  } catch (e) {
    console.error('[cron/spotlight-reminder] Failed to fetch spotlight articles:', e)
    return NextResponse.json({ error: 'Failed to fetch spotlight articles' }, { status: 500 })
  }

  // Group article counts by business_id
  const articleCountByBusiness = new Map<string, number>()
  for (const article of articles) {
    const bid = article.business_id
    articleCountByBusiness.set(bid, (articleCountByBusiness.get(bid) ?? 0) + 1)
  }

  const businessRows = businesses.map((b) => ({
    name: b.name,
    articlesThisQuarter: articleCountByBusiness.get(b.id) ?? 0,
    status: b.status || 'unknown',
  }))

  const missing = businessRows.filter((b) => b.articlesThisQuarter === 0).length

  await sendSpotlightReminderEmail({
    quarter,
    year,
    businesses: businessRows,
    adminUrl: `${siteUrl}/admin/spotlight`,
  })

  return NextResponse.json({
    ok: true,
    sent: 1,
    total: businesses.length,
    missing,
  })
}
