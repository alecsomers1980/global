// One-off: enable MP4 downloads on the EVEREST CF Stream video that broke the
// 2026-05-08 posts, wait for the MP4 to render, then re-queue the two failed
// posts so the publish-scheduled cron retries them.
//
// Cause: cloudflareStreamService.createStreamFromUrl called POST /downloads too
// early (before readyToStream=true) and swallowed the error. The URL
// /downloads/default.mp4 has been returning 404 ever since. Now that the video
// is ready, re-enabling downloads will generate the MP4.
//
// Run: node scripts/unstick-everest-may-08.mjs

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    try {
        const text = readFileSync(resolve(file), 'utf8')
        for (const line of text.split('\n')) {
            const clean = line.replace(/\r$/, '')
            const m = clean.match(/^([A-Z0-9_]+)=(.*)$/)
            if (m && !process.env[m[1]]) {
                let v = m[2]
                if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
                process.env[m[1]] = v
            }
        }
    } catch { }
}

// ember-social has Supabase creds; everest-motoring has the CF Stream creds.
loadEnv('.env.local')
loadEnv('.env.production')
loadEnv('../everest-motoring/.env.local')

const UID = 'ae17d6f7c8bf2ca8641ca45ed0fbe665'
const POST_IDS = [
    'ecedb5da-8adf-4d10-9b54-e90aa57352dc',
    '98adfefa-2db1-4151-b269-73265a1c67d2',
]
const MP4_URL = `https://customer-n0h1tl1ja253bs5w.cloudflarestream.com/${UID}/downloads/default.mp4`

const cfAcct = process.env.CLOUDFLARE_ACCOUNT_ID
const cfTok = process.env.CLOUDFLARE_STREAM_API_TOKEN
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!cfAcct || !cfTok) throw new Error('Missing CF env')
if (!sbUrl || !sbKey) throw new Error('Missing Supabase env')

const cfHeaders = { Authorization: `Bearer ${cfTok}`, 'Content-Type': 'application/json' }

async function enableDownloads() {
    console.log('[1/4] POST /downloads to enable MP4 generation…')
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAcct}/stream/${UID}/downloads`,
        { method: 'POST', headers: cfHeaders }
    )
    const body = await res.json()
    if (!res.ok || !body.success) {
        throw new Error(`CF enable downloads failed: ${JSON.stringify(body)}`)
    }
    console.log('     CF response:', JSON.stringify(body.result))
}

async function waitForMp4(maxWaitMs = 5 * 60 * 1000) {
    console.log('[2/4] Polling CF /downloads until default.mp4 is ready…')
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cfAcct}/stream/${UID}/downloads`,
            { headers: cfHeaders }
        )
        const body = await res.json()
        const def = body?.result?.default
        if (def) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(1)
            console.log(`     state=${def.status} pct=${def.percentComplete ?? '?'} (${elapsed}s)`)
            if (def.status === 'ready') return
            if (def.status === 'error') throw new Error('CF MP4 generation errored')
        } else {
            console.log('     (no default entry yet)')
        }
        await new Promise(r => setTimeout(r, 5000))
    }
    throw new Error('Timed out waiting for MP4')
}

async function verifyUrl() {
    console.log('[3/4] HEAD the MP4 URL to confirm Facebook can fetch it…')
    const res = await fetch(MP4_URL, { method: 'HEAD' })
    console.log(`     ${MP4_URL} → ${res.status}`)
    if (!res.ok) throw new Error(`MP4 URL returned ${res.status}`)
}

async function requeuePosts() {
    console.log('[4/4] Setting both posts back to status=approved…')
    for (const id of POST_IDS) {
        const res = await fetch(`${sbUrl}/rest/v1/posts?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                apikey: sbKey,
                Authorization: `Bearer ${sbKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify({ status: 'approved', last_error: null }),
        })
        const body = await res.text()
        if (!res.ok) throw new Error(`Supabase patch ${id} failed: ${res.status} ${body}`)
        const parsed = JSON.parse(body)
        console.log(`     ${id} → status=${parsed[0]?.status}`)
    }
}

await enableDownloads()
await waitForMp4()
await verifyUrl()
await requeuePosts()
console.log('\nDone. Next publish-scheduled cron tick (≤5 min) will retry both posts.')
