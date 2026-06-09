import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const workspaceName = 'Everest Motoring'
  const workspaceSlug = 'everest-motoring'

  console.log(`Checking for workspace: ${workspaceName}...`)

  // 1. Create or Get Workspace
  let { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', workspaceSlug)
    .single()

  if (wsError && wsError.code !== 'PGRST116') {
    console.error('Error fetching workspace:', wsError)
    process.exit(1)
  }

  if (!workspace) {
    console.log('Creating workspace...')
    const { data: newWs, error: insertError } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName, slug: workspaceSlug })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating workspace:', insertError)
      process.exit(1)
    }
    workspace = newWs
  }

  console.log(`Workspace ID: ${workspace.id}`)

  // 2. Generate API Key
  const rawKey = `es_${crypto.randomBytes(24).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  console.log('Generating API Key...')
  const { error: keyError } = await supabase
    .from('workspace_api_keys')
    .insert({
      workspace_id: workspace.id,
      key_hash: keyHash,
      label: 'Everest Motoring Integration'
    })

  if (keyError) {
    console.error('Error creating API key:', keyError)
    process.exit(1)
  }

  console.log('\nSUCCESS!')
  console.log('-----------------------------------')
  console.log(`RAW API KEY: ${rawKey}`)
  console.log('-----------------------------------')
  console.log('IMPORTANT: Copy the RAW API KEY above and paste it into Everest Motoring\'s .env.local file.')
}

main()
