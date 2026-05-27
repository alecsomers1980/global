import PocketBase from 'pocketbase'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ADMIN_EMAIL = 'alec@firewireit.co.za'
const ADMIN_PASSWORD = 'Ph03n1x@135'

const SECTORS = [
  'Retail',
  'Food & Restaurants',
  'Construction',
  'Automotive',
  'Beauty & Wellness',
  'Education & Training',
  'Healthcare',
  'Hospitality & Lodges',
  'Professional Services',
  'Transport & Logistics',
  'Agriculture',
  'Manufacturing',
  'Entertainment & Events',
  'Real Estate',
  'Tourism',
  'IT & Technology',
  'Financial Services',
]

const AREAS = [
  'Acornhoek',
  'Bushbuckridge Town',
  'Casteel',
  'Cottondale',
  'Dwarsloop',
  'Hluvukani',
  'Hoxani',
  'Justicia',
  'Lillydale',
  'Mkhuhlu',
  'Shatale',
  'Thulamahashe',
  'Welverdiend',
  'Other',
]

async function main() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  console.log('Authenticating as superuser…')
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)

  // --- 1. Fix collection rules so the signup + webhook flow can write records.
  // businesses: any authenticated user may create their own; updates from any
  // server-side caller (webhook runs without auth) are allowed.
  const rulesToApply = [
    {
      name: 'businesses',
      createRule: '@request.auth.id != ""',
      updateRule: '',
    },
    {
      name: 'subscriptions',
      createRule: '@request.auth.id != ""',
      updateRule: '',
    },
    {
      // Open create on payments because /api/renew runs unauthenticated
      // (token-signed link from email). Activation still requires a verified
      // Yoco webhook, so creating bare pending records is harmless.
      name: 'payments',
      createRule: '',
      updateRule: '',
    },
  ]

  for (const { name, createRule, updateRule } of rulesToApply) {
    try {
      const col = await pb.collections.getFirstListItem(`name="${name}"`)
      await pb.collections.update(col.id, { createRule, updateRule })
      console.log(`✅ ${name}: createRule="${createRule}" updateRule="${updateRule}"`)
    } catch (e) {
      console.error(`❌ ${name}:`, e.message)
    }
  }

  // --- 2. Seed sectors and areas with starter data.
  const slugify = (s) =>
    s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  for (const name of SECTORS) {
    const slug = slugify(name)
    try {
      await pb.collection('sectors').create({ name, slug })
      console.log(`  + sector: ${name}`)
    } catch (e) {
      const data = e?.response?.data || {}
      const isDup = Object.values(data).some((v) => v?.code === 'validation_not_unique')
      if (isDup) console.log(`  · sector exists: ${name}`)
      else console.error(`  ! sector ${name}:`, JSON.stringify(data))
    }
  }

  for (const name of AREAS) {
    const slug = slugify(name)
    try {
      await pb.collection('areas').create({ name, slug })
      console.log(`  + area: ${name}`)
    } catch (e) {
      const data = e?.response?.data || {}
      const isDup = Object.values(data).some((v) => v?.code === 'validation_not_unique')
      if (isDup) console.log(`  · area exists: ${name}`)
      else console.error(`  ! area ${name}:`, JSON.stringify(data))
    }
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
