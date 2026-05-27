import PocketBase from 'pocketbase'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ADMIN_EMAIL = 'alec@firewireit.co.za'
const ADMIN_PASSWORD = 'Ph03n1x@135'

const NEW_TIERS = ['basic', 'pro-lead', 'pro-business']
const TIER_MIGRATION = {
  standard: 'basic',
  enhanced: 'pro-lead',
  premium: 'pro-business',
}

async function main() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  console.log('Authenticating as superuser…')
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)

  // Look up users collection id for the owner relation
  const usersCol = await pb.collections.getFirstListItem('name="users"')
  const businessesCol = await pb.collections.getFirstListItem('name="businesses"')

  // ============================================================
  // 1. businesses — add owner + contact_person, switch tier enum
  // ============================================================
  console.log('\n=== businesses ===')

  // PB enum constraint forbids writing values not in the current set, so:
  //   step a) widen enum to old ∪ new
  //   step b) rewrite each record to the new tier value
  //   step c) narrow enum to just the new set
  const widenedTierField = businessesCol.fields.map((f) =>
    f.name === 'package_tier'
      ? { ...f, values: [...new Set([...f.values, ...NEW_TIERS])] }
      : f
  )
  await pb.collections.update(businessesCol.id, { fields: widenedTierField })
  console.log('  widened package_tier enum (transient)')

  const oldBusinesses = await pb.collection('businesses').getList(1, 100)
  for (const b of oldBusinesses.items) {
    const oldTier = b.package_tier
    const newTier = TIER_MIGRATION[oldTier]
    if (newTier && newTier !== oldTier) {
      await pb.collection('businesses').update(b.id, { package_tier: newTier })
      console.log(`  migrated ${b.name}: ${oldTier} -> ${newTier}`)
    }
  }

  // Re-fetch after the widen so we have the latest field array
  const businessesColAfterWiden = await pb.collections.getFirstListItem('name="businesses"')
  const updatedBusinessFields = businessesColAfterWiden.fields.map((f) => {
    if (f.name === 'package_tier') {
      return { ...f, values: NEW_TIERS }
    }
    return f
  })

  const hasOwner = updatedBusinessFields.some((f) => f.name === 'owner')
  if (!hasOwner) {
    updatedBusinessFields.push({
      name: 'owner',
      type: 'relation',
      required: false,
      collectionId: usersCol.id,
      maxSelect: 1,
      cascadeDelete: false,
    })
  }
  const hasContact = updatedBusinessFields.some((f) => f.name === 'contact_person')
  if (!hasContact) {
    updatedBusinessFields.push({
      name: 'contact_person',
      type: 'text',
      required: false,
    })
  }

  await pb.collections.update(businessesCol.id, { fields: updatedBusinessFields })
  console.log('  ✅ businesses schema updated (tier enum + owner + contact_person)')

  // ============================================================
  // 2. subscriptions — switch tier/status enums, add amount_cents, starts_at
  // ============================================================
  console.log('\n=== subscriptions ===')
  const subsCol = await pb.collections.getFirstListItem('name="subscriptions"')
  const updatedSubFields = subsCol.fields.map((f) => {
    if (f.name === 'tier') return { ...f, values: NEW_TIERS }
    if (f.name === 'status') {
      return { ...f, values: ['pending', 'active', 'expired', 'cancelled'] }
    }
    return f
  })
  if (!updatedSubFields.some((f) => f.name === 'amount_cents')) {
    updatedSubFields.push({ name: 'amount_cents', type: 'number', required: false })
  }
  if (!updatedSubFields.some((f) => f.name === 'starts_at')) {
    updatedSubFields.push({ name: 'starts_at', type: 'date', required: false })
  }
  await pb.collections.update(subsCol.id, { fields: updatedSubFields })
  console.log('  ✅ subscriptions schema updated')

  // ============================================================
  // 3. payments — restructure to match the new code
  // ============================================================
  console.log('\n=== payments ===')
  const paymentsCol = await pb.collections.getFirstListItem('name="payments"')

  const keepFields = paymentsCol.fields.filter((f) =>
    ['id', 'business', 'created', 'updated'].includes(f.name)
  )

  const newPaymentFields = [
    ...keepFields,
    { name: 'subscription', type: 'relation', collectionId: subsCol.id, maxSelect: 1, cascadeDelete: false, required: false },
    { name: 'amount_cents', type: 'number', required: false },
    { name: 'provider', type: 'text', required: false },
    { name: 'status', type: 'select', values: ['pending', 'successful', 'failed'], maxSelect: 1, required: false },
    { name: 'description', type: 'text', required: false },
    { name: 'provider_reference', type: 'text', required: false },
    { name: 'provider_metadata', type: 'json', required: false },
    { name: 'paid_at', type: 'date', required: false },
  ]

  await pb.collections.update(paymentsCol.id, { fields: newPaymentFields })
  console.log('  ✅ payments schema rebuilt')

  console.log('\nDone.')
}

main().catch((e) => {
  console.error('Fatal:', e?.response || e)
  process.exit(1)
})
