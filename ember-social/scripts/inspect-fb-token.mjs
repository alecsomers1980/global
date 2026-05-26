/**
 * Inspect the Facebook / Instagram access tokens currently stored in
 * social_accounts for Everest. Confirms they are Page tokens (not User
 * tokens), lists granted scopes, and surfaces any nasty surprises.
 *
 *   cd ember-social
 *   node scripts/inspect-fb-token.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    try {
        const text = readFileSync(resolve(file), 'utf8')
        for (const rawLine of text.split('\n')) {
            const line = rawLine.replace(/\r$/, '')
            const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
            if (m) {
                let v = m[2]
                if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
                process.env[m[1]] = v
            }
        }
    } catch (e) {
        console.error('env load failed:', e.message)
    }
}
loadEnv('.env.local')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const META_APP_ID = process.env.META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3' // Everest

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}
if (!META_APP_ID || !META_APP_SECRET) {
    console.warn('META_APP_ID / META_APP_SECRET not set — debug_token will use the token itself (less authoritative)')
}

const APP_TOKEN = META_APP_ID && META_APP_SECRET ? `${META_APP_ID}|${META_APP_SECRET}` : null

async function fetchAccounts() {
    const r = await fetch(
        `${SUPABASE_URL}/rest/v1/social_accounts?select=id,platform,account_id,account_name,access_token,token_expires_at&workspace_id=eq.${WORKSPACE_ID}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    return r.json()
}

async function debugToken(inputToken) {
    const auth = APP_TOKEN || inputToken
    const url = `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(inputToken)}&access_token=${encodeURIComponent(auth)}`
    const r = await fetch(url)
    return r.json()
}

async function tryFetchInsights(platformPostId, accessToken, platform) {
    if (!platformPostId) return null
    const fields = platform === 'instagram'
        ? 'like_count,comments_count,insights.metric(impressions,reach).as(insights)'
        : 'reactions.summary(total_count),comments.summary(total_count),shares,insights.metric(post_impressions).as(insights)'
    const url = `https://graph.facebook.com/v19.0/${platformPostId}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`
    const r = await fetch(url)
    return r.json()
}

async function findRecentPlatformPost(platform) {
    // Grab the most recent post_results row for Everest with a platform_post_id
    const r = await fetch(
        `${SUPABASE_URL}/rest/v1/post_results?select=platform_post_id,platform,posts!inner(workspace_id)&platform=eq.${platform}&platform_post_id=not.is.null&posts.workspace_id=eq.${WORKSPACE_ID}&order=id.desc&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rows = await r.json()
    return Array.isArray(rows) && rows[0] ? rows[0].platform_post_id : null
}

const PALETTE = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

;(async () => {
    const accounts = await fetchAccounts()
    if (!Array.isArray(accounts) || accounts.length === 0) {
        console.log('No social accounts found for Everest.')
        return
    }

    console.log(PALETTE.bold(`\nFound ${accounts.length} social account(s) for Everest:\n`))

    for (const acct of accounts) {
        console.log(PALETTE.bold(`${acct.platform.toUpperCase()} - ${acct.account_name}`))
        console.log(`  account_id: ${acct.account_id}`)
        console.log(`  token (first 20 chars): ${(acct.access_token || '').slice(0, 20)}...`)
        console.log(`  token_expires_at (in DB): ${acct.token_expires_at || 'null (never)'}`)

        const dbg = await debugToken(acct.access_token)
        if (dbg.error) {
            console.log(PALETTE.red(`  debug_token error: ${dbg.error.message}`))
            console.log()
            continue
        }

        const d = dbg.data || {}
        const isPageToken = d.type === 'PAGE'
        const expiresAt = d.expires_at === 0 ? 'never' : d.expires_at ? new Date(d.expires_at * 1000).toISOString() : 'unknown'
        const dataAccessExpires = d.data_access_expires_at === 0 ? 'never' : d.data_access_expires_at ? new Date(d.data_access_expires_at * 1000).toISOString() : 'unknown'

        console.log(`  type: ${isPageToken ? PALETTE.green(d.type) : PALETTE.red(d.type || 'unknown')} ${isPageToken ? '(good — page-scoped)' : '(bad — needs page token for insights)'}`)
        console.log(`  app_id: ${d.app_id || '-'}`)
        console.log(`  profile_id: ${d.profile_id || '-'} (the FB Page id)`)
        console.log(`  is_valid: ${d.is_valid ? PALETTE.green('true') : PALETTE.red('false')}`)
        console.log(`  expires_at: ${expiresAt}`)
        console.log(`  data_access_expires_at: ${dataAccessExpires}`)
        if (Array.isArray(d.scopes)) {
            const requiredScopes = acct.platform === 'instagram'
                ? ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement']
                : ['pages_read_engagement', 'pages_manage_posts', 'pages_show_list']
            console.log(`  scopes:`)
            const granted = new Set(d.scopes)
            for (const s of d.scopes.sort()) {
                console.log(`    - ${s}`)
            }
            const missing = requiredScopes.filter(s => !granted.has(s))
            if (missing.length > 0) {
                console.log(PALETTE.yellow(`  MISSING required scopes: ${missing.join(', ')}`))
            } else {
                console.log(PALETTE.green(`  All expected scopes present.`))
            }
        }

        // Optional live insights smoke test against a real recent post
        const recentPostId = await findRecentPlatformPost(acct.platform)
        if (recentPostId) {
            console.log(PALETTE.dim(`  Smoke-testing insights on post ${recentPostId}...`))
            const res = await tryFetchInsights(recentPostId, acct.access_token, acct.platform)
            if (res.error) {
                console.log(PALETTE.red(`    insights error: ${res.error.message} (code ${res.error.code})`))
            } else {
                const has = (k) => res[k] !== undefined && res[k] !== null
                const hits = []
                if (has('like_count')) hits.push(`like_count=${res.like_count}`)
                if (has('comments_count')) hits.push(`comments_count=${res.comments_count}`)
                if (has('reactions')) hits.push(`reactions=${res.reactions?.summary?.total_count}`)
                if (has('comments')) hits.push(`comments=${res.comments?.summary?.total_count}`)
                if (has('shares')) hits.push(`shares=${res.shares?.count}`)
                const insightsData = res.insights?.data
                if (Array.isArray(insightsData) && insightsData.length > 0) {
                    for (const m of insightsData) {
                        hits.push(`${m.name}=${m.values?.[0]?.value}`)
                    }
                } else {
                    hits.push(PALETTE.yellow('no insights data returned'))
                }
                console.log(PALETTE.green(`    ${hits.join(' | ')}`))
            }
        } else {
            console.log(PALETTE.dim(`  (no published posts with platform_post_id found yet — insights smoke test skipped)`))
        }

        console.log()
    }
})().catch(e => {
    console.error(PALETTE.red('Fatal:'), e)
    process.exit(1)
})
