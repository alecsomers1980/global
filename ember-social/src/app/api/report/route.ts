import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * GET /api/report?month=YYYY-MM
 *
 * Aggregated social stats scoped to a calendar month, compared to the previous
 * month. Authenticated with the workspace's Ember API key:
 *   Authorization: Bearer es_...
 * The workspace is derived from the key (same scheme as /api/trigger), so no
 * workspace id in the URL and no separate report secret are needed.
 *
 * Returns { current: { totals, perPlatform, postsPublished }, previous: {...} }
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer es_')) {
    return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 })
  }
  const rawKey = authHeader.replace('Bearer ', '')
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: '?month=YYYY-MM required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Resolve workspace from the API key (same lookup as /api/trigger).
  const { data: keyRecord } = await supabase
    .from('workspace_api_keys')
    .select('workspace_id')
    .eq('key_hash', keyHash)
    .single()

  if (!keyRecord) {
    return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 })
  }
  const workspaceId = (keyRecord as any).workspace_id

  const [year, mon] = month.split('-').map(Number)

  // Curr window: first day of given month to first day of next month
  const currStart = new Date(Date.UTC(year, mon - 1, 1)).toISOString()
  const currEnd = new Date(Date.UTC(year, mon, 1)).toISOString()

  // Prev window
  const prevYear = mon === 1 ? year - 1 : year
  const prevMon = mon === 1 ? 12 : mon - 1
  const prevStart = new Date(Date.UTC(prevYear, prevMon - 1, 1)).toISOString()
  const prevEnd = new Date(Date.UTC(prevYear, prevMon, 1)).toISOString()

  const { data: rows, error } = await supabase
    .from('post_results')
    .select(
      'platform, platform_post_id, impressions, reach, likes, comments, shares, fetched_at, posts!inner(id, scheduled_at)'
    )
    .eq('posts.workspace_id', workspaceId)
    .order('fetched_at', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({
      current: emptyWindowResult(),
      previous: emptyWindowResult(),
    })
  }

  const typed = rows as any[]

  return NextResponse.json({
    current: aggregateInWindow(typed, currStart, currEnd),
    previous: aggregateInWindow(typed, prevStart, prevEnd),
  })
}

function emptyWindowResult() {
  return {
    totals: { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 },
    perPlatform: {} as Record<string, any>,
    postsPublished: 0,
  }
}

function aggregateInWindow(rows: any[], start: string, end: string) {
  const postsSeen = new Set<string>()

  const totals = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
  const perPlatform: Record<
    string,
    { impressions: number; reach: number; likes: number; comments: number; shares: number }
  > = {}

  for (const row of rows) {
    const scheduledAt = row.posts?.scheduled_at
    if (!scheduledAt) continue

    // Check if in window
    if (scheduledAt < start || scheduledAt >= end) continue

    const likes = row.likes || 0
    const comments = row.comments || 0
    const shares = row.shares || 0
    const impressions = row.impressions || 0
    const reach = row.reach || 0

    totals.impressions += impressions
    totals.reach += reach
    totals.likes += likes
    totals.comments += comments
    totals.shares += shares

    const p = row.platform || 'unknown'
    if (!perPlatform[p]) {
      perPlatform[p] = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
    }
    perPlatform[p].impressions += impressions
    perPlatform[p].reach += reach
    perPlatform[p].likes += likes
    perPlatform[p].comments += comments
    perPlatform[p].shares += shares

    // Track unique posts
    const postId = row.posts?.id
    if (postId) postsSeen.add(postId)
  }

  return {
    totals,
    perPlatform,
    postsPublished: postsSeen.size,
  }
}
