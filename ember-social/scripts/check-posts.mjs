import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '../.env.local')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const index = trimmed.indexOf('=')
    if (index > 0) {
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim()
      env[key] = value
    }
  })
  return env
}

const env = loadEnv(envFile)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function checkPosts() {
  const { data: workspaces } = await supabase.from('workspaces').select('id, name').eq('slug', 'everest-motoring')
  if (!workspaces || workspaces.length === 0) {
    console.log('No workspace found for everest-motoring')
    return
  }
  const workspaceId = workspaces[0].id
  console.log(`Workspace: ${workspaces[0].name} (${workspaceId})`)

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, status, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching posts:', error)
  } else {
    console.log(`Found ${posts.length} posts:`)
    console.log(JSON.stringify(posts, null, 2))
  }
}

checkPosts()
