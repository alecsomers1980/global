import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envRaw = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(envRaw.split('\n').filter(Boolean).map(l => l.split('=')))

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctfwxbrjyxjcdsrbdxxz.supabase.co'
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupBucket() {
  const bucketName = 'images'
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  const exists = buckets.find(b => b.name === bucketName)
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true })
    if (createError) {
      console.error('Error creating bucket:', createError)
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`)
    }
  } else {
    // ensure it is public
    const { error: updateError } = await supabase.storage.updateBucket(bucketName, { public: true })
    if (updateError) {
       console.error('Error updating bucket:', updateError)
    } else {
       console.log(`Bucket '${bucketName}' already exists and is public.`)
    }
  }
}

setupBucket()
