// Inspect current post statuses + any errors. Read-only.
// Run: node scripts/check-stuck-posts.mjs

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

async function q(path) {
    const res = await fetch(`${url}/rest/v1/${path}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    return { status: res.status, body: await res.text() }
}

console.log('--- Status counts (last 30 days) ---')
const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
const all = await q(`posts?select=status&created_at=gte.${sinceIso}`)
const counts = {}
for (const r of JSON.parse(all.body)) counts[r.status] = (counts[r.status] || 0) + 1
console.log(counts)

console.log('\n--- Posts stuck in publishing ---')
const stuck = await q(`posts?select=id,status,scheduled_at,last_error,created_at&status=eq.publishing&order=created_at.desc&limit=10`)
console.log(stuck.body)

console.log('\n--- Latest failed posts (with last_error) ---')
const failed = await q(`posts?select=id,status,scheduled_at,last_error,created_at&status=eq.failed&order=created_at.desc&limit=5`)
console.log(failed.body)

console.log('\n--- Approved posts with scheduled_at <= now (cron should be picking these up) ---')
const nowIso = new Date().toISOString()
const dueApproved = await q(`posts?select=id,scheduled_at,created_at&status=eq.approved&scheduled_at=lte.${nowIso}&order=scheduled_at.asc&limit=10`)
console.log(dueApproved.body)

console.log('\n--- Approved posts scheduled in the future (waiting for cron) ---')
const futureApproved = await q(`posts?select=id,scheduled_at&status=eq.approved&scheduled_at=gt.${nowIso}&order=scheduled_at.asc&limit=10`)
console.log(futureApproved.body)
