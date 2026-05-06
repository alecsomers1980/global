// ============================================
// MIGRATE RVR INC TO NEW SUPABASE
// Usage: node migrate_to_new_supabase.mjs <DB_PASSWORD>
// ============================================

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import dns from 'dns'
import { promisify } from 'util'

dns.setServers(['8.8.8.8', '1.1.1.1'])
const resolve6 = promisify(dns.resolve6)
const resolve4 = promisify(dns.resolve4)

const DB_PASSWORD = process.argv[2]
if (!DB_PASSWORD) {
  console.error('Usage: node migrate_to_new_supabase.mjs <DB_PASSWORD>')
  process.exit(1)
}

const PROJECT_REF = 'ctfwxbrjyxjcdsrbdxxz'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const DB_HOST = `db.${PROJECT_REF}.supabase.co`
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'

async function resolveHost(hostname) {
  try {
    const addrs = await resolve6(hostname)
    return { address: addrs[0], family: 6 }
  } catch {
    const addrs = await resolve4(hostname)
    return { address: addrs[0], family: 4 }
  }
}

// Supabase client for storage operations
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function execSQL(pool, description, sql) {
  console.log(`\n[${description}]...`)
  try {
    await pool.query(sql)
    console.log(`  OK`)
  } catch (err) {
    console.error(`  FAILED: ${err.message}`)
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log(`  (non-fatal, continuing)`)
    } else {
      throw err
    }
  }
}

async function runSQLFile(pool, filePath) {
  const name = path.basename(filePath)
  console.log(`\n=== Running ${name} ===`)
  const sql = fs.readFileSync(filePath, 'utf8')
  await execSQL(pool, name, sql)
}

async function setupStorageBuckets() {
  console.log('\n=== Setting up storage buckets ===')

  const buckets = [
    { name: 'case-documents', public: false },
  ]

  const { data: existing, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) {
    console.error(`  Failed to list buckets: ${listErr.message}`)
    return
  }

  for (const bucket of buckets) {
    const exists = existing.find(b => b.name === bucket.name)
    if (exists) {
      console.log(`  Bucket '${bucket.name}' exists, updating...`)
      const { error: updateErr } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
      })
      if (updateErr) {
        console.error(`  Update failed: ${updateErr.message}`)
      } else {
        console.log(`  Updated`)
      }
    } else {
      console.log(`  Creating bucket '${bucket.name}'...`)
      const { error: createErr } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
      })
      if (createErr) {
        console.error(`  Create failed: ${createErr.message}`)
      } else {
        console.log(`  Created`)
      }
    }
  }
}

async function verifyMigration(pool) {
  console.log('\n=== Verifying tables ===')

  const expectedTables = [
    'practice_areas', 'attorneys', 'blog_posts', 'profiles',
    'cases', 'documents', 'appointments',
    'case_statuses', 'case_status_history',
  ]

  const { rows } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
  )
  const existing = new Set(rows.map(r => r.table_name))

  let allGood = true
  for (const t of expectedTables) {
    if (existing.has(t)) {
      const { rows: countRows } = await pool.query(`SELECT count(*) as c FROM public."${t}"`)
      console.log(`  ${t} (${countRows[0].c} rows)`)
    } else {
      console.log(`  ${t} MISSING`)
      allGood = false
    }
  }

  // Verify columns on cases table
  console.log('\n=== Verifying cases columns ===')
  const { rows: cols } = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cases' AND table_schema = 'public' ORDER BY column_name"
  )
  const colNames = new Set(cols.map(c => c.column_name))
  const expectedCols = ['accident_date', 'status_notes', 'status_phase', 'scheduled_date', 'diary_date']
  for (const c of expectedCols) {
    console.log(colNames.has(c) ? `  ${c}` : `  ${c} MISSING`)
  }

  console.log(allGood ? '\n All tables present!' : '\n Some tables missing!')
}

async function main() {
  console.log('=== RVR INC: MIGRATE TO NEW SUPABASE ===')
  console.log(`Target: ${SUPABASE_URL}`)

  // Resolve IP via public DNS first
  console.log(`\nResolving ${DB_HOST}...`)
  const { address, family } = await resolveHost(DB_HOST)
  console.log(`Resolved to ${address} (IPv${family})`)

  const pool = new pg.Pool({
    host: address,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false, servername: DB_HOST },
  })

  try {
    // Test pg connection
    console.log('\nTesting database connection...')
    await pool.query('SELECT 1')
    console.log(' Connected to database')

    // 1. Main schema
    await runSQLFile(pool, 'supabase/schema.sql')

    // 2. RAF status system
    await runSQLFile(pool, 'supabase/raf_status_migration.sql')

    // 3. Prescription tracking
    await runSQLFile(pool, 'supabase/add_prescription_tracking.sql')

    // 4. Setup storage
    await setupStorageBuckets()

    // 5. Verify
    await verifyMigration(pool)

    console.log('\n=== MIGRATION COMPLETE ===')
  } catch (err) {
    console.error('\nFATAL:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
