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
    } catch (e) { console.error('env load failed:', e.message) }
}
loadEnv('.env.local')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const wsId = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3' // Everest

const r = await fetch(
    `${url}/rest/v1/posts?select=id,status,scheduled_at,pillar,rationale,variants,content,platforms,approval_token,created_at&workspace_id=eq.${wsId}&status=eq.pending_approval`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
const posts = await r.json()
console.log(`Pending posts: ${posts.length}\n`)
for (const p of posts) {
    console.log('id:', p.id)
    console.log('pillar:', p.pillar)
    console.log('rationale:', p.rationale)
    console.log('platforms:', p.platforms)
    console.log('scheduled_at:', p.scheduled_at)
    console.log('approval_token:', p.approval_token)
    console.log('content (first 200):', (p.content || '').slice(0, 200))
    console.log('variants keys:', Object.keys(p.variants || {}))
    if (p.variants?.facebook) console.log('  fb content len:', p.variants.facebook.content?.length, 'hashtags:', p.variants.facebook.hashtags?.length)
    if (p.variants?.instagram) console.log('  ig content len:', p.variants.instagram.content?.length, 'hashtags:', p.variants.instagram.hashtags?.length)
    if (p.variants?.tiktok) console.log('  tt content len:', p.variants.tiktok.content?.length, 'hashtags:', p.variants.tiktok.hashtags?.length)
    console.log('---')
}
