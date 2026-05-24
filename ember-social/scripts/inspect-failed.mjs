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

const ids = ['ecedb5da-8adf-4d10-9b54-e90aa57352dc', '98adfefa-2db1-4151-b269-73265a1c67d2']
for (const id of ids) {
    const r = await fetch(`${url}/rest/v1/posts?select=id,status,scheduled_at,platforms,media_urls,content,last_error,workspace_id,approval_token&id=eq.${id}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    console.log(JSON.stringify(JSON.parse(await r.text()), null, 2))
    console.log('---')
}
