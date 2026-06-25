import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Records one follower-count snapshot per connected social account into
 * follower_snapshots. Self-throttling: if any snapshot was taken in the last
 * 20 hours it skips, so it can be called from a frequent cron yet only records
 * ~once per day. Best-effort — one account's failure never stops the rest.
 */
export async function recordFollowerSnapshots(
    supabase: SupabaseClient
): Promise<{ inserted: number; errors: number; skipped?: boolean }> {
    // Once-per-day guard.
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
        .from('follower_snapshots')
        .select('id')
        .gte('captured_at', twentyHoursAgo)
        .limit(1)
    if (recent && recent.length > 0) {
        return { inserted: 0, errors: 0, skipped: true }
    }

    const { data: accounts, error: fetchError } = await supabase
        .from('social_accounts')
        .select('id, workspace_id, platform, access_token, refresh_token, account_id')

    if (fetchError) {
        console.error('[follower-snapshot] Failed to fetch social_accounts:', fetchError)
        return { inserted: 0, errors: 1 }
    }

    const rows = (accounts || []) as any[]
    let inserted = 0
    let errors = 0

    for (const account of rows) {
        try {
            const { workspace_id, platform, account_id, access_token, refresh_token } = account
            let followers: number | null = null

            if (platform === 'facebook' || platform === 'instagram') {
                const url = `https://graph.facebook.com/v19.0/${account_id}?fields=followers_count&access_token=${access_token}`
                const fbData = await (await fetch(url)).json()
                if (fbData.error || fbData.followers_count == null) {
                    console.error('[follower-snapshot] FB/IG error for', account_id, fbData.error || fbData)
                    errors++
                    continue
                }
                followers = fbData.followers_count as number
            } else if (platform === 'youtube') {
                if (!refresh_token) { errors++; continue }
                const freshToken = await refreshGoogleAccessToken(refresh_token)
                const ytData = await (
                    await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${account_id}`, {
                        headers: { Authorization: `Bearer ${freshToken}` },
                    })
                ).json()
                const count = ytData?.items?.[0]?.statistics?.subscriberCount
                if (ytData.error || count == null) {
                    console.error('[follower-snapshot] YouTube error for', account_id, ytData.error || ytData)
                    errors++
                    continue
                }
                followers = Number(count)
            } else {
                continue
            }

            if (followers != null && isFinite(followers)) {
                const { error: insertError } = await supabase
                    .from('follower_snapshots')
                    .insert({
                        workspace_id,
                        platform,
                        account_id,
                        followers,
                        captured_at: new Date().toISOString(),
                    } as any)
                if (insertError) {
                    console.error('[follower-snapshot] insert error for', account_id, insertError)
                    errors++
                } else {
                    inserted++
                }
            }
        } catch (err) {
            console.error('[follower-snapshot] unexpected error for', account.id, err)
            errors++
        }
    }

    return { inserted, errors }
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
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
    if (!res.ok || data.error) throw new Error(data.error_description || data.error || 'refresh failed')
    return data.access_token as string
}
