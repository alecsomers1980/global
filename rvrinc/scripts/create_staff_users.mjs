// Create staff/attorney/admin users for RVR Inc branches
// Usage: node scripts/create_staff_users.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ctfwxbrjyxjcdsrbdxxz.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'

const DEFAULT_PASSWORD = 'RvrInc2026!'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const users = [
  // Pretoria — staff
  { email: 'minah@rvrinc.co.za', full_name: 'Minah', role: 'staff', branch: 'pretoria' },
  { email: 'werner@rvrinc.co.za', full_name: 'Werner', role: 'staff', branch: 'pretoria' },
  { email: 'sara@rvrinc.co.za', full_name: 'Sara', role: 'staff', branch: 'pretoria' },
  { email: 'karyn@rvrinc.co.za', full_name: 'Karyn', role: 'staff', branch: 'pretoria' },
  { email: 'roxanne@rvrinc.co.za', full_name: 'Roxanne', role: 'staff', branch: 'pretoria' },
  { email: 'lizzy@rvrinc.co.za', full_name: 'Lizzy', role: 'staff', branch: 'pretoria' },

  // Marble Hall — staff
  { email: 'lineque@rvrinc.co.za', full_name: 'Lineque', role: 'staff', branch: 'marble-hall' },
  { email: 'olgah@rvrinc.co.za', full_name: 'Olgah', role: 'staff', branch: 'marble-hall' },
  { email: 'martie@rvrinc.co.za', full_name: 'Martie', role: 'staff', branch: 'marble-hall' },
  { email: 'alwyn@rvrinc.co.za', full_name: 'Alwyn', role: 'staff', branch: 'marble-hall' },

  // Admin — both branches (home branch pretoria, but code logic lets admins see all)
  { email: 'tanya@rvrinc.co.za', full_name: 'Tanya', role: 'admin', branch: 'pretoria' },
  { email: 'belinda@rvrinc.co.za', full_name: 'Belinda', role: 'admin', branch: 'pretoria' },
]

async function main() {
  console.log('=== Creating RVR Inc Staff Users ===\n')

  for (const u of users) {
    // First check if auth user already exists
    const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers()
    const existingAuth = existingUsers?.users?.find(au => au.email === u.email)

    if (existingAuth) {
      console.log(`  ${u.full_name}: auth user exists, upserting profile...`)
      const { error: updateErr } = await supabase
        .from('profiles')
        .upsert({
          id: existingAuth.id,
          full_name: u.full_name,
          email: u.email,
          role: u.role,
          branch: u.branch,
          profile_completed: false,
        })
      if (updateErr) {
        console.error(`  ${u.full_name}: profile upsert FAILED - ${updateErr.message}`)
      } else {
        console.log(`  ${u.full_name}: profile upserted (${u.role}, ${u.branch}, id: ${existingAuth.id})`)
      }
      continue
    }

    // Create new auth user
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, branch: u.branch },
    })

    if (authErr) {
      console.error(`  ${u.full_name}: auth create FAILED - ${authErr.message}`)
      continue
    }

    const uid = authUser.user.id

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: uid,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        branch: u.branch,
        profile_completed: false,
      })

    if (profileErr) {
      console.error(`  ${u.full_name}: profile FAILED - ${profileErr.message}`)
    } else {
      console.log(`  ${u.full_name}: OK (${u.role}, ${u.branch}, id: ${uid})`)
    }
  }

  // Update existing attorney users (Karmi/K Du Plessis, Nieuwoudt/HCN Du Plessis)
  console.log('\n=== Updating existing attorneys ===')

  const existingAttorneys = [
    { email: 'k@rvrinc.co.za', full_name: 'Karmi Du Plessis', branch: 'pretoria' },
    { email: 'hcn@rvrinc.co.za', full_name: 'Nieuwoudt Du Plessis', branch: 'pretoria' },
  ]

  for (const atty of existingAttorneys) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', atty.email)
      .single()

    if (!profile) {
      console.log(`  ${atty.full_name}: profile not found, skipping`)
      continue
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        full_name: atty.full_name,
        branch: atty.branch,
        profile_completed: false,
      })
      .eq('id', profile.id)

    if (updateErr) {
      console.error(`  ${atty.full_name}: update FAILED - ${updateErr.message}`)
    } else {
      console.log(`  ${atty.full_name}: branch set to ${atty.branch}, profile_completed=false`)
    }
  }

  // Verify
  console.log('\n=== Verification ===')
  const { data: allProfiles, error: countErr } = await supabase
    .from('profiles')
    .select('full_name, role, branch, profile_completed')
    .in('role', ['admin', 'staff', 'attorney'])

  if (allProfiles) {
    for (const p of allProfiles) {
      console.log(`  ${p.full_name} | ${p.role} | ${p.branch || 'none'} | completed: ${p.profile_completed}`)
    }
    console.log(`\n  Total: ${allProfiles.length} admin/staff/attorney profiles`)
  }

  console.log('\n=== Done ===')
}

main().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})
