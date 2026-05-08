// One-shot check: does posts.last_error exist in production?
// Run: node scripts/check-migration-005.mjs

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
    } catch { /* ignore */ }
}

loadEnv('.env.local')
loadEnv('.env.production')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(2)
}

const target = `${url}/rest/v1/posts?select=id,last_error&limit=1`
const res = await fetch(target, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
})

const body = await res.text()

if (res.status >= 200 && res.status < 300) {
    console.log('PASS — posts.last_error exists. Sample response:')
    console.log(body)
    process.exit(0)
}

if (body.includes('last_error') && body.toLowerCase().includes('does not exist')) {
    console.error('FAIL — last_error column is missing. Migration 005 has not been applied yet.')
    console.error(body)
    process.exit(1)
}

console.error(`Unexpected status ${res.status}:`)
console.error(body)
process.exit(3)
