// ============================================
// MIGRATE RIVERVIEW PREP TO NEW SUPABASE
// Usage: node migrate_to_new_supabase.mjs <DB_PASSWORD>
// ============================================

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const DB_PASSWORD = process.argv[2]
if (!DB_PASSWORD) {
  console.error('Usage: node migrate_to_new_supabase.mjs <DB_PASSWORD>')
  process.exit(1)
}

const PROJECT_REF = 'ctfwxbrjyxjcdsrbdxxz'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'

// Direct PostgreSQL connection
const pool = new pg.Pool({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

// Supabase client for storage operations
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function execSQL(description, sql) {
  console.log(`\n[${description}]...`)
  try {
    await pool.query(sql)
    console.log(`  ✓ OK`)
  } catch (err) {
    console.error(`  ✗ FAILED: ${err.message}`)
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log(`  (non-fatal, continuing)`)
    } else {
      throw err
    }
  }
}

async function runSQLFile(filePath) {
  const name = path.basename(filePath)
  console.log(`\n=== Running ${name} ===`)
  const sql = fs.readFileSync(filePath, 'utf8')
  await execSQL(name, sql)
}

async function setupStorageBuckets() {
  console.log('\n=== Setting up storage buckets ===')

  const buckets = [
    { name: 'images', public: true },
    { name: 'documents', public: true },
  ]

  const { data: existing, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) {
    console.error(`  ✗ Failed to list buckets: ${listErr.message}`)
    return
  }

  for (const bucket of buckets) {
    const exists = existing.find(b => b.name === bucket.name)
    if (exists) {
      console.log(`  Bucket '${bucket.name}' exists, ensuring public...`)
      const { error: updateErr } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
      })
      if (updateErr) {
        console.error(`  ✗ Update failed: ${updateErr.message}`)
      } else {
        console.log(`  ✓ Updated`)
      }
    } else {
      console.log(`  Creating bucket '${bucket.name}'...`)
      const { error: createErr } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
      })
      if (createErr) {
        console.error(`  ✗ Create failed: ${createErr.message}`)
      } else {
        console.log(`  ✓ Created`)
      }
    }
  }
}

async function verifyMigration() {
  console.log('\n=== Verifying tables ===')

  const expectedTables = [
    'events', 'calendar_entries', 'contact_submissions', 'school_documents',
    'homepage_events', 'homepage_posters', 'homepage_values', 'homepage_testimonials',
    'homepage_associations', 'staff', 'newsletters', 'newsletter_sections',
    'gallery_categories', 'gallery_albums', 'gallery_images', 'announcements',
    'alumni', 'settings', 'newsletter_subscribers', 'permission_slips',
    'permission_slip_responses', 'enrolment_applications', 'community_photos',
    'event_bookings',
  ]

  const { rows } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
  )
  const existing = new Set(rows.map(r => r.table_name))

  let allGood = true
  for (const t of expectedTables) {
    if (existing.has(t)) {
      // Get row count
      const { rows: countRows } = await pool.query(`SELECT count(*) as c FROM "${t}"`)
      console.log(`  ✓ ${t} (${countRows[0].c} rows)`)
    } else {
      console.log(`  ✗ ${t} MISSING`)
      allGood = false
    }
  }

  console.log(allGood ? '\n✓ All tables present!' : '\n⚠ Some tables missing!')
}

async function main() {
  console.log('=== RIVERVIEW PREP: MIGRATE TO NEW SUPABASE ===')
  console.log(`Target: ${SUPABASE_URL}`)

  try {
    // Test pg connection
    console.log('\nTesting database connection...')
    await pool.query('SELECT 1')
    console.log('✓ Connected to database')

    // Run schema + seed in dependency order
    // 1. Main schema
    await runSQLFile('migration.sql')

    // 2. Gallery system (must run before gallery seed data)
    await runSQLFile('gallery_system_v1.sql')

    // 3. Schema extensions
    await runSQLFile('newsletter_schema_v2.sql')
    await runSQLFile('update_alumni_schema.sql')
    await runSQLFile('newsletter_subscribers_migration.sql')
    await runSQLFile('permission_slips_migration.sql')
    await runSQLFile('gold_features_migration.sql')
    await runSQLFile('event_bookings_migration.sql')

    // 4. Seed data
    await runSQLFile('calendar_2026_seed.sql')
    await runSQLFile('seed_historic_newsletters.sql')
    await runSQLFile('seed_new_newsletters.sql')
    await runSQLFile('gallery_seed_data.sql')

    // 5. Setup storage
    await setupStorageBuckets()

    // 6. Verify
    await verifyMigration()

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
