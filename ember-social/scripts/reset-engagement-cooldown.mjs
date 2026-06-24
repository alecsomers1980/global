// Forces the engagement back-fill to re-run on the NEXT publish-scheduled cron
// (every 5 min) instead of waiting up to 6h, by clearing fetched_at on a
// workspace's post_results. Scoped to ONE workspace (resolved from the Ember
// API key) so other clients are never touched.
//
// RUN:  node scripts/reset-engagement-cooldown.mjs
//
// NOTE: this only yields reach/impressions if the Facebook page has already been
// reconnected with the read_insights scope. If you reset before reconnecting,
// just run it again after reconnecting.

import { readFileSync } from 'node:fs'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function envFrom(path, key) {
  try {
    const txt = readFileSync(new URL(path, import.meta.url), 'utf8')
    const line = txt.split(/\r?\n/).find((l) => l.startsWith(key + '='))
    return line ? line.slice(key.length + 1).trim().replace(/^"|"$/g, '') : null
  } catch {
    return null
  }
}

const url = envFrom('../.env.local', 'NEXT_PUBLIC_SUPABASE_URL')
const serviceKey = envFrom('../.env.local', 'SUPABASE_SERVICE_ROLE_KEY')
const apiKey = envFrom('../../everest-motoring/.env.local', 'EMBER_SOCIAL_API_KEY')

if (!url || !serviceKey) { console.error('Missing Supabase creds in ember-social/.env.local'); process.exit(1) }
if (!apiKey) { console.error('Missing EMBER_SOCIAL_API_KEY (everest-motoring/.env.local)'); process.exit(1) }

const supabase = createClient(url, serviceKey)
const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

const { data: keyRec, error: keyErr } = await supabase
  .from('workspace_api_keys').select('workspace_id').eq('key_hash', keyHash).single()
if (keyErr || !keyRec) { console.error('Could not resolve workspace from API key:', keyErr?.message); process.exit(1) }
const workspaceId = keyRec.workspace_id

const { data: ws } = await supabase.from('workspaces').select('name, slug').eq('id', workspaceId).single()
console.log(`Target workspace: ${ws?.name} (${ws?.slug}) — ${workspaceId}`)

const { data: posts } = await supabase.from('posts').select('id').eq('workspace_id', workspaceId)
const ids = (posts || []).map((p) => p.id)
if (ids.length === 0) { console.log('No posts for this workspace. Nothing to reset.'); process.exit(0) }

const { data: prRows } = await supabase
  .from('post_results').select('id, platform, fetched_at').in('post_id', ids)
console.log(`post_results rows: ${prRows?.length || 0}`)
console.log(`  already pending (fetched_at null): ${(prRows || []).filter((r) => !r.fetched_at).length}`)

const { data: updated, error: updErr } = await supabase
  .from('post_results').update({ fetched_at: null }).in('post_id', ids).select('id')
if (updErr) { console.error('Reset failed:', updErr.message); process.exit(1) }

console.log(`\n✓ Reset fetched_at=null on ${updated?.length || 0} post_results rows.`)
console.log('The publish-scheduled cron (every 5 min) will re-fetch metrics on its next run.')
console.log('Re-check with: node ../everest-motoring/scripts/diagnose-report.mjs')
