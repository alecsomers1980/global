/**
 * Minimal OpenAI gpt-image-1 smoke test — confirms the billing hard limit was
 * raised before committing to a full 16-image batch. Generates ONE small image
 * (~$0.02-0.04) and reports success/failure.
 *
 *   cd ember-social
 *   node scripts/check-openai-billing.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    const text = readFileSync(resolve(file), 'utf8')
    for (const rawLine of text.split('\n')) {
        const line = rawLine.replace(/\r$/, '')
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

console.log('Testing OpenAI gpt-image-1 with a single low-cost image…')
const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: 'A plain matte black square background, minimalist, studio lighting',
        size: '1024x1024',
        quality: 'low',
        n: 1,
    }),
})
const data = await r.json()

if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data)
    console.error(`\n❌ STILL BLOCKED (HTTP ${r.status}): ${msg}`)
    if (/billing/i.test(msg)) {
        console.error('   → The hard limit is still in effect. Raise it at:')
        console.error('     https://platform.openai.com/settings/organization/limits')
    }
    process.exit(1)
}

if (data?.data?.[0]?.b64_json) {
    writeFileSync(resolve('public/preview/_billing-test.png'), Buffer.from(data.data[0].b64_json, 'base64'))
    console.log('\n✅ BILLING OK — gpt-image-1 generated an image successfully.')
    console.log('   You can now regenerate the full batch (Generate Marketing Plan).')
} else {
    console.error('\n⚠ Unexpected response:', JSON.stringify(data).slice(0, 400))
    process.exit(1)
}
