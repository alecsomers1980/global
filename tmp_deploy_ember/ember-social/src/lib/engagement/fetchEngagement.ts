import type { SupabaseClient } from '@supabase/supabase-js'

export async function fetchEngagementSnapshot(supabase: SupabaseClient): Promise<{ updated: number; errors: number }> {
    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()

    // Find post_results that need fresh metrics:
    // - platform_post_id exists, AND
    // - (fetched_at is null OR fetched_at < 6 hours ago), AND
    // - the post was scheduled at least 1 hour ago (give FB/IG time to accumulate)
    const { data: rows, error: queryErr } = await supabase
        .from('post_results')
        .select('id, post_id, platform, platform_post_id, posts!inner(scheduled_at, workspace_id)')
        .not('platform_post_id', 'is', null)
        .or(`fetched_at.is.null,fetched_at.lt.${sixHoursAgo}`)
        .lte('posts.scheduled_at', oneHourAgo)
        .order('fetched_at', { ascending: true, nullsFirst: true })
        .limit(50)

    if (queryErr) {
        console.error('[fetchEngagement] query error:', queryErr)
        return { updated: 0, errors: 1 }
    }

    if (!rows || rows.length === 0) {
        return { updated: 0, errors: 0 }
    }

    // Cache access tokens per (workspace_id, platform) so we don't re-fetch for every post
    const tokenCache = new Map<string, string>()

    let updated = 0
    let errors = 0

    for (const row of rows as any[]) {
        try {
            const workspaceId = row.posts.workspace_id
            const platform = row.platform
            const cacheKey = `${workspaceId}:${platform}`

            if (!tokenCache.has(cacheKey)) {
                const { data: acct } = await supabase
                    .from('social_accounts')
                    .select('access_token')
                    .eq('workspace_id', workspaceId)
                    .eq('platform', platform)
                    .limit(1)
                    .maybeSingle()

                if (acct?.access_token) {
                    tokenCache.set(cacheKey, acct.access_token)
                } else {
                    // No connected account for this platform — skip silently
                    errors++
                    continue
                }
            }

            const accessToken = tokenCache.get(cacheKey)!

            let metrics: { impressions: number | null; reach: number | null; likes: number | null; comments: number | null; shares: number | null } | null = null

            if (platform === 'facebook') {
                metrics = await fetchFacebookMetrics(row.platform_post_id, accessToken)
            } else if (platform === 'instagram') {
                metrics = await fetchInstagramMetrics(row.platform_post_id, accessToken)
            }

            // For unsupported platforms, leave metrics null and update fetched_at to stop retries
            if (metrics === null) {
                metrics = { impressions: null, reach: null, likes: null, comments: null, shares: null }
            }

            const { error: updateErr } = await supabase
                .from('post_results')
                .update({
                    impressions: metrics.impressions,
                    reach: metrics.reach,
                    likes: metrics.likes,
                    comments: metrics.comments,
                    shares: metrics.shares,
                    fetched_at: now.toISOString(),
                } as any)
                .eq('id', row.id)

            if (updateErr) {
                console.error(`[fetchEngagement] update error for ${row.id}:`, updateErr)
                errors++
            } else {
                updated++
            }
        } catch (err: any) {
            console.error(`[fetchEngagement] error for row ${row.id}:`, err)
            errors++
        }
    }

    return { updated, errors }
}

async function fetchFacebookMetrics(postId: string, accessToken: string) {
    try {
        const url = `https://graph.facebook.com/v19.0/${postId}?fields=reactions.summary(total_count),comments.summary(total_count),shares,insights.metric(post_impressions,post_impressions_unique).as(insights)&access_token=${accessToken}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.error) {
            console.error('[fetchEngagement] FB API error:', data.error)
            return null
        }
        const impressions = data?.insights?.data?.[0]?.values?.[0]?.value || null
        return {
            impressions,
            reach: null, // FB doesn't expose reach here without page-level token
            likes: data?.reactions?.summary?.total_count ?? null,
            comments: data?.comments?.summary?.total_count ?? null,
            shares: data?.shares?.count ?? null,
        }
    } catch (err: any) {
        console.error('[fetchEngagement] FB fetch error:', err)
        return null
    }
}

async function fetchInstagramMetrics(mediaId: string, accessToken: string) {
    try {
        const url = `https://graph.facebook.com/v19.0/${mediaId}?fields=like_count,comments_count,insights.metric(impressions,reach).as(insights)&access_token=${accessToken}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.error) {
            console.error('[fetchEngagement] IG API error:', data.error)
            return null
        }
        const impressions = data?.insights?.data?.find((m: any) => m.name === 'impressions')?.values?.[0]?.value || null
        const reach = data?.insights?.data?.find((m: any) => m.name === 'reach')?.values?.[0]?.value || null
        return {
            impressions,
            reach,
            likes: data?.like_count ?? null,
            comments: data?.comments_count ?? null,
            shares: null, // IG doesn't expose shares
        }
    } catch (err: any) {
        console.error('[fetchEngagement] IG fetch error:', err)
        return null
    }
}
