import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envFile, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=')
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim()
  }
})

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

async function run() {
  const token = '2f081eec-ac50-4199-b164-ea7620305327'
  const { data: workspaces } = await supabase.from('workspaces').select('id').eq('slug', 'everest-motoring').single()
  const { data, error } = await supabase
    .from('posts')
    .select('id, content, status, media_urls, scheduled_at, last_error')
    .eq('workspace_id', workspaces.id)
    .order('scheduled_at', { ascending: false })
    .limit(30)
    
  if (error) {
    console.error('Error fetching posts:', error)
    return
  }
  
  console.log(`Found ${data.length} posts.`)
  data.forEach(p => {
    console.log(`\nPost ${p.id}:`)
    console.log(`Date: ${p.scheduled_at}`)
    console.log(`Status: ${p.status}`)
    if (p.last_error) console.log(`Error: ${p.last_error}`)
    console.log(`Media URLs:`, p.media_urls)
  })
}

run()
