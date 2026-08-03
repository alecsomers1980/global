/**
 * One-off: publish the landscape family reel to the Everest YouTube channel.
 * Mirrors src/lib/publish.ts publishToYouTube (resumable upload) + Google token refresh.
 *
 *   cd ember-social
 *   node scripts/youtube-publish-family-reel.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')
const U = process.env.NEXT_PUBLIC_SUPABASE_URL, K = process.env.SUPABASE_SERVICE_ROLE_KEY
const WS = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'
const h = { apikey: K, Authorization: `Bearer ${K}` }

const VIDEO_URL = `${U}/storage/v1/object/public/campaign-media/july-2026-review/post-03.mp4`
const TITLE = 'Where the Weekend Takes You \u{1F304} | Everest Motoring White River'
const DESCRIPTION = `Saturday belongs to you. \u{1F305} Pack the family, point it at the mountains, and let the day unfold — the right SUV makes the whole escape feel effortless.

At Everest Motoring in White River, Mpumalanga, we help you find the vehicle that turns every weekend into an adventure. Quality used cars, each workshop-checked, with finance arranged in-house.

\u{1F4DE} 013 854 0600
\u{1F310} https://everestmotoring.co.za
\u{1F4CD} White River, Mpumalanga

#EverestMotoring #WhiteRiver #Mpumalanga #FamilySUV #WeekendEscape #UsedCarsSA`

async function refreshGoogleToken(refreshToken) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            refresh_token: refreshToken, grant_type: 'refresh_token',
        }).toString(),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error_description || data.error || 'token refresh failed')
    return { accessToken: data.access_token, expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString() }
}

async function main() {
    const acc = (await (await fetch(`${U}/rest/v1/social_accounts?workspace_id=eq.${WS}&platform=eq.youtube&select=account_id,account_name,access_token,refresh_token,token_expires_at`, { headers: h })).json())[0]
    if (!acc) throw new Error('No YouTube account connected')
    console.log('Channel:', acc.account_name)

    // Refresh (token is expired)
    let token = acc.access_token
    const exp = acc.token_expires_at ? new Date(acc.token_expires_at).getTime() : 0
    if (!exp || exp < Date.now() + 60000) {
        if (!acc.refresh_token) throw new Error('No refresh token — reconnect the channel')
        console.log('Refreshing Google access token...')
        const r = await refreshGoogleToken(acc.refresh_token)
        token = r.accessToken
        await fetch(`${U}/rest/v1/social_accounts?workspace_id=eq.${WS}&platform=eq.youtube&account_id=eq.${acc.account_id}`, {
            method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify({ access_token: token, token_expires_at: r.expiresAt }),
        })
        console.log('  token refreshed.')
    }

    console.log('Downloading video:', VIDEO_URL)
    const vr = await fetch(VIDEO_URL)
    if (!vr.ok) throw new Error(`download failed ${vr.status}`)
    const buf = Buffer.from(await vr.arrayBuffer())
    const ct = vr.headers.get('content-type') || 'video/mp4'
    console.log(`  ${(buf.length / 1024 / 1024).toFixed(2)} MB, ${ct}`)

    const metadata = { snippet: { title: TITLE, description: DESCRIPTION }, status: { privacyStatus: 'public' } }

    console.log('Starting resumable upload...')
    const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': ct,
            'X-Upload-Content-Length': String(buf.length),
        },
        body: JSON.stringify(metadata),
    })
    if (!initRes.ok) throw new Error(`init failed ${initRes.status}: ${(await initRes.text()).slice(0, 400)}`)
    const uploadUrl = initRes.headers.get('location')
    if (!uploadUrl) throw new Error('no resumable URL returned')

    console.log('Uploading bytes...')
    const up = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': ct, 'Content-Length': String(buf.length) }, body: buf })
    const upData = await up.json()
    if (!up.ok || upData.error) throw new Error(upData.error?.message || `upload failed ${up.status}`)

    console.log(`\n✅ Published to YouTube.`)
    console.log(`   Video ID: ${upData.id}`)
    console.log(`   Watch:    https://youtu.be/${upData.id}`)
    console.log(`   Studio:   https://studio.youtube.com/video/${upData.id}/edit`)
}
main().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
