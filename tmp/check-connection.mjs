
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const everestEnvPath = 'c:/Users/info.DESKTOP-4S1UAQ7/OneDrive/Documents/Antigravity/everest-motoring/.env.local'
const emberEnvPath = 'c:/Users/info.DESKTOP-4S1UAQ7/OneDrive/Documents/Antigravity/ember-social/.env.local'

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

const everestEnv = loadEnv(everestEnvPath)
const emberEnv = loadEnv(emberEnvPath)

const apiKey = everestEnv.EMBER_SOCIAL_API_KEY
if (!apiKey) {
  console.error('❌ EMBER_SOCIAL_API_KEY not found in everest-motoring/.env.local')
  process.exit(1)
}

const supabaseUrl = emberEnv.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = emberEnv.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration not found in ember-social/.env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
  console.log('🔍 Checking connection configuration...')
  
  // 1. Hash the key
  const rawKey = apiKey.replace('Bearer ', '').replace('es_', '')
  // Wait, the route.ts does: const rawKey = authHeader.replace('Bearer ', '')
  // And the key in .env includes 'es_'
  const actualRawKey = apiKey.startsWith('es_') ? apiKey : `es_${apiKey}`
  const keyHash = crypto.createHash('sha256').update(actualRawKey).digest('hex')
  
  console.log(`🔑 API Key (masked): ${apiKey.slice(0, 10)}...`)
  console.log(`🔐 Key Hash: ${keyHash}`)

  // 2. Lookup in DB
  const { data: keyRecord, error: keyError } = await supabase
    .from('workspace_api_keys')
    .select('id, workspace_id, label')
    .eq('key_hash', keyHash)
    .single()

  if (keyError) {
    console.error('❌ API Key not found in Ember Social database or query failed:', keyError.message)
  } else {
    console.log('✅ API Key found in database!')
    console.log(`🏷️  Label: ${keyRecord.label}`)
    
    // 3. Lookup Workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('name, slug')
      .eq('id', keyRecord.workspace_id)
      .single()
      
    if (wsError) {
      console.error('❌ Workspace not found for this key:', wsError.message)
    } else {
      console.log(`🏢 Workspace: ${workspace.name} (${workspace.slug})`)
      if (workspace.slug.includes('everest')) {
        console.log('✨ SUCCESS: Connection configuration is valid and points to Everest Motoring!')
      } else {
        console.log('⚠️ WARNING: Key is valid but points to a different workspace:', workspace.name)
      }
    }
  }

  // 4. Check Server
  console.log('\n🌐 Checking if Ember Social server is reachable...')
  try {
    const response = await fetch(`${everestEnv.EMBER_SOCIAL_URL || 'http://localhost:3000'}/api/trigger`, {
        method: 'OPTIONS'
    })
    console.log(`📡 Server status: ${response.status} ${response.statusText}`)
  } catch (err) {
    console.log('❌ Server is UNREACHABLE at', everestEnv.EMBER_SOCIAL_URL || 'http://localhost:3000')
    console.log('👉 Tip: Run "npm run dev" in the ember-social directory.')
  }
}

verify()
