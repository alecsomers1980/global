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
                    .select('access_token, refresh_token')
                    .eq('workspace_id', workspaceId)
                    .eq('platform', platform)
                    .limit(1)
                    .maybeSingle()

                if (!acct?.access_token) {
                    // No connected account for this platform — skip silently
                    errors++
                    continue
                }

                let usableToken = acct.access_token
                // Google (YouTube) access tokens expire after ~1h, so the stored token is
                // almost always stale by the time this runs — refresh it first.
                if (platform === 'youtube' && acct.refresh_token) {
                    try {
                        const refreshed = await refreshGoogleAccessToken(acct.refresh_token)
                        usableToken = refreshed.accessToken
                        await supabase
                            .from('social_accounts')
                            .update({ access_token: refreshed.accessToken, token_expires_at: refreshed.expiresAt } as any)
                            .eq('workspace_id', workspaceId)
                            .eq('platform', platform)
                    } catch (e: any) {
                        console.error('[fetchEngagement] YouTube token refresh failed:', e?.message || e)
                    }
                }
                tokenCache.set(cacheKey, usableToken)
            }

            const accessToken = tokenCache.get(cacheKey)!

            let metrics: { impressions: number | null; reach: number | null; likes: number | null; comments: number | null; shares: number | null } | null = null

            if (platform === 'facebook') {
                metrics = await fetchFacebookMetrics(row.platform_post_id, accessToken)
            } else if (platform === 'instagram') {
                metrics = await fetchInstagramMetrics(row.platform_post_id, accessToken)
            } else if (platform === 'youtube') {
                metrics = await fetchYouTubeMetrics(row.platform_post_id, accessToken)
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
        // Post-level impression/reach metrics (post_impressions, post_impressions_unique)
        // were deprecated by Meta on 2026-06-15 and now return "(#100) The value must be a
        // valid insights metric" — which previously failed the WHOLE request and zeroed
        // even likes/comments. We now request only engagement, which still works. Reach
        // and impressions are no longer available per-post from the Graph API.
        const url = `https://graph.facebook.com/v19.0/${postId}?fields=reactions.summary(total_count),comments.summary(total_count),shares&access_token=${accessToken}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.error) {
            console.error('[fetchEngagement] FB API error:', data.error)
            return null
        }
        return {
            impressions: null, // deprecated by Meta 2026-06-15
            reach: null,       // deprecated by Meta 2026-06-15
            likes: data?.reactions?.summary?.total_count ?? null,
            comments: data?.comments?.summary?.total_count ?? null,
            shares: data?.shares?.count ?? null,
        }
    } catch (err: any) {
        console.error('[fetchEngagement] FB fetch error:', err)
        return null
    }
}

// YouTube public statistics for a video. platform_post_id is the video id.
// Uses the connected channel's OAuth token; videoCount/viewCount come from the
// public statistics part. YouTube has no "reach" concept, so we map views ->
// impressions and leave reach null. shares are not exposed by the Data API.
async function fetchYouTubeMetrics(videoId: string, accessToken: string) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
        const data = await res.json()
        if (data.error) {
            console.error('[fetchEngagement] YouTube API error:', data.error)
            return null
        }
        const stats = data?.items?.[0]?.statistics
        if (!stats) {
            console.error('[fetchEngagement] YouTube: no statistics for video', videoId)
            return null
        }
        return {
            impressions: stats.viewCount != null ? Number(stats.viewCount) : null,
            reach: null,
            likes: stats.likeCount != null ? Number(stats.likeCount) : null,
            comments: stats.commentCount != null ? Number(stats.commentCount) : null,
            shares: null,
        }
    } catch (err: any) {
        console.error('[fetchEngagement] YouTube fetch error:', err)
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

// Google (YouTube) access tokens expire after ~1h. Mirror the refresh used by the
// publish flow so engagement back-fill uses a fresh token instead of the stale one.
async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }).toString(),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
        throw new Error(data.error_description || data.error || 'Failed to refresh Google token')
    }
    const expiresIn: number = data.expires_in || 3600
    return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }
}
