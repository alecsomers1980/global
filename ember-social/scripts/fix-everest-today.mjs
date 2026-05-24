// Re-target today's 3 Everest approved posts and delete the stuck one.
// Run: node scripts/fix-everest-today.mjs

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    try {
        const text = readFileSync(resolve(file), 'utf8')
        for (const line of text.split('\n')) {
            const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
            if (m && !process.env[m[1]]) {
                let v = m[2]
                if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
                process.env[m[1]] = v
            }
        }
    } catch { }
}

loadEnv('.env.local')
loadEnv('.env.production')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
    console.error('Missing env')
    process.exit(2)
}

async function patch(path, body) {
    const res = await fetch(`${url}/rest/v1/${path}`, {
        method: 'PATCH',
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.text() }
}

async function del(path) {
    const res = await fetch(`${url}/rest/v1/${path}`, {
        method: 'DELETE',
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=representation' },
    })
    return { status: res.status, body: await res.text() }
}

// Today (UTC date matches SAST date for these slots)
const today = new Date().toISOString().split('T')[0]

const updates = [
    { id: 'e9055a16-9e7a-45a7-aed0-9917ca8ee478', scheduled_at: `${today}T07:30:00+00:00` }, // 09:30 SAST
    { id: '98adfefa-2db1-4151-b269-73265a1c67d2', scheduled_at: `${today}T11:00:00+00:00` }, // 13:00 SAST
    { id: 'ecedb5da-8adf-4d10-9b54-e90aa57352dc', scheduled_at: `${today}T14:00:00+00:00` }, // 16:00 SAST
]

console.log(`Re-targeting 3 approved posts to ${today}...`)
for (const u of updates) {
    const r = await patch(`posts?id=eq.${u.id}`, { scheduled_at: u.scheduled_at })
    if (r.status >= 200 && r.status < 300) {
        const row = JSON.parse(r.body)[0]
        console.log(`  ✓ ${u.id} → ${row.scheduled_at}`)
    } else {
        console.error(`  ✗ ${u.id} status=${r.status}: ${r.body}`)
    }
}

console.log('\nDeleting stuck post dc69e903-78b6-47ff-9446-c00fb00c868f...')
const stuckId = 'dc69e903-78b6-47ff-9446-c00fb00c868f'
const dr = await del(`posts?id=eq.${stuckId}`)
if (dr.status >= 200 && dr.status < 300) {
    const arr = JSON.parse(dr.body)
    console.log(`  ✓ deleted (${arr.length} row${arr.length === 1 ? '' : 's'})`)
} else {
    console.error(`  ✗ status=${dr.status}: ${dr.body}`)
}
