import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/pocketbase/service'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { business, author_name, author_email, rating, comment, company_website, ts } = body

  // --- bot protection ---
  // 1. Honeypot: real users never fill this hidden field.
  if (company_website) {
    // Pretend success so bots don't learn the trap.
    return NextResponse.json({ ok: true })
  }
  // 2. Timing: form must take at least 3s and at most 1h to complete.
  const elapsed = Date.now() - Number(ts || 0)
  if (!ts || isNaN(elapsed) || elapsed < 3000 || elapsed > 3600000) {
    return NextResponse.json({ error: 'Submission rejected. Please try again.' }, { status: 400 })
  }
  // 3. Spam heuristic: reject comments stuffed with links.
  const linkCount = (String(comment || '').match(/https?:\/\//gi) || []).length
  if (linkCount > 2) {
    return NextResponse.json({ error: 'Too many links in your comment.' }, { status: 400 })
  }

  // --- validation ---
  const name = String(author_name || '').trim()
  const email = String(author_email || '').trim()
  const text = String(comment || '').trim()
  const stars = Math.round(Number(rating))

  if (!business || !name || !email || !text) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (!(stars >= 1 && stars <= 5)) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 })
  }
  if (text.length < 3 || text.length > 2000) {
    return NextResponse.json({ error: 'Comment must be 3–2000 characters.' }, { status: 400 })
  }

  let svc
  try {
    svc = await createServiceClient()
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 })
  }

  // Confirm the business exists and its tier allows reviews (Pro Lead+).
  let biz: any
  try {
    biz = await svc.collection('businesses').getOne(business)
  } catch {
    return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
  }
  if (biz.package_tier !== 'pro-lead' && biz.package_tier !== 'pro-business') {
    return NextResponse.json({ error: 'Reviews are not enabled for this listing.' }, { status: 403 })
  }

  // 4. Dedupe: one pending/recent review per email per business in 24h.
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace('T', ' ')
    const recent = await svc.collection('reviews').getList(1, 1, {
      filter: `business = "${business}" && author_email = "${email.replace(/"/g, '')}" && created >= "${dayAgo}"`,
    })
    if (recent.totalItems > 0) {
      return NextResponse.json({ error: 'You have already submitted a review recently.' }, { status: 429 })
    }
  } catch {
    // non-fatal
  }

  try {
    await svc.collection('reviews').create({
      business,
      author_name: name,
      author_email: email,
      rating: stars,
      comment: text,
      status: 'pending',
    })
  } catch (e) {
    console.error('[reviews/create] failed:', e)
    return NextResponse.json({ error: 'Could not submit review.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
