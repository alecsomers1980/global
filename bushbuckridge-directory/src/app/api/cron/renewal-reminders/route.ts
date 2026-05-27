import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { signRenewalToken } from '@/lib/tokens'
import { sendRenewalReminder } from '@/lib/email'

const REMINDER_DAYS = [30, 14, 7, 1] as const

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic Listing',
  'pro-lead': 'Pro Lead Package',
  'pro-business': 'Pro Business Listing',
}

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

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const results: Array<{ day: number; sent: number; errors: number }> = []

  for (const days of REMINDER_DAYS) {
    const target = addDays(new Date(), days)
    const from = startOfDay(target).toISOString()
    const to = endOfDay(target).toISOString()

    let subs: any[] = []
    try {
      const page = await pb.collection('subscriptions').getList(1, 200, {
        filter: `status = "active" && expires_at >= "${from}" && expires_at <= "${to}"`,
      })
      subs = page.items
    } catch (e) {
      console.error(`Cron: failed to query subscriptions for ${days}d window`, e)
      results.push({ day: days, sent: 0, errors: 1 })
      continue
    }

    let sent = 0
    let errors = 0

    for (const sub of subs) {
      try {
        const business = await pb.collection('businesses').getOne(sub.business)
        if (!business?.email) continue

        const token = signRenewalToken(sub.id)
        const renewUrl = `${siteUrl}/api/renew?s=${encodeURIComponent(token.s)}&e=${token.e}&t=${encodeURIComponent(token.t)}`

        const ok = await sendRenewalReminder({
          to: business.email,
          businessName: business.name,
          tier: sub.tier,
          amount: `R${(sub.amount_cents / 100).toFixed(2)}`,
          expiresAt: new Date(sub.expires_at),
          daysUntilExpiry: days,
          renewUrl,
        })

        if (ok) sent++
        else errors++
      } catch (e) {
        console.error(`Cron: error processing subscription ${sub.id}`, e)
        errors++
      }
    }

    results.push({ day: days, sent, errors })
  }

  return NextResponse.json({ ok: true, results })
}
