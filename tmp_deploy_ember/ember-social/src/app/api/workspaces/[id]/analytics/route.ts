import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const workspaceId = await resolveWorkspaceId(id)

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: rows, error } = await supabase
        .from('post_results')
        .select('platform, platform_post_id, impressions, reach, likes, comments, shares, fetched_at, posts!inner(id, scheduled_at, campaign_batches(schedule_pattern))')
        .eq('posts.workspace_id', workspaceId)
        .order('fetched_at', { ascending: false })
        .limit(200)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Empty state
    if (!rows || rows.length === 0) {
        return NextResponse.json({
            totals: { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 },
            perPlatform: {},
            perPattern: { tue_thu_sat: { total: 0, count: 0, avgEngagement: 0 }, mon_wed_fri: { total: 0, count: 0, avgEngagement: 0 } },
            timeseries: [],
        })
    }

    const typed = rows as any[]

    // Totals
    let totImpressions = 0
    let totReach = 0
    let totLikes = 0
    let totComments = 0
    let totShares = 0

    // Per platform
    const platformTotals: Record<string, { impressions: number; reach: number; likes: number; comments: number; shares: number }> = {}

    // Per pattern
    let tueThuTotal = 0
    let tueThuCount = 0
    let monWedTotal = 0
    let monWedCount = 0

    // Timeseries — group by date
    const byDate: Record<string, { impressions: number; reach: number; likes: number; comments: number; shares: number }> = {}

    for (const row of typed) {
        const likes = row.likes || 0
        const comments = row.comments || 0
        const shares = row.shares || 0
        const impressions = row.impressions || 0
        const reach = row.reach || 0

        totImpressions += impressions
        totReach += reach
        totLikes += likes
        totComments += comments
        totShares += shares

        // Per platform
        const p = row.platform || 'unknown'
        if (!platformTotals[p]) platformTotals[p] = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
        platformTotals[p].impressions += impressions
        platformTotals[p].reach += reach
        platformTotals[p].likes += likes
        platformTotals[p].comments += comments
        platformTotals[p].shares += shares

        // Per pattern
        const pattern = (row.posts as any)?.campaign_batches?.schedule_pattern
        const engagement = likes + comments + shares
        if (pattern === 'tue_thu_sat') { tueThuTotal += engagement; tueThuCount++ }
        if (pattern === 'mon_wed_fri') { monWedTotal += engagement; monWedCount++ }

        // Timeseries
        const dateKey = row.posts?.scheduled_at?.split('T')[0]
        if (dateKey) {
            if (!byDate[dateKey]) byDate[dateKey] = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
            byDate[dateKey].impressions += impressions
            byDate[dateKey].reach += reach
            byDate[dateKey].likes += likes
            byDate[dateKey].comments += comments
            byDate[dateKey].shares += shares
        }
    }

    const timeseries = Object.entries(byDate)
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
        totals: {
            impressions: totImpressions,
            reach: totReach,
            likes: totLikes,
            comments: totComments,
            shares: totShares,
        },
        perPlatform: platformTotals,
        perPattern: {
            tue_thu_sat: { total: tueThuTotal, count: tueThuCount, avgEngagement: tueThuCount > 0 ? tueThuTotal / tueThuCount : 0 },
            mon_wed_fri: { total: monWedTotal, count: monWedCount, avgEngagement: monWedCount > 0 ? monWedTotal / monWedCount : 0 },
        },
        timeseries,
    })
}
