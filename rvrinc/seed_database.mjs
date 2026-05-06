// Seed RVR Inc database with practice areas and attorneys
// Usage: node seed_database.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ctfwxbrjyxjcdsrbdxxz.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const practiceAreas = [
  {
    slug: 'litigation',
    title: 'Civil Litigation',
    description: "Expert representation in High Court and Magistrate's Court disputes. We handle complex commercial litigation, contractual disputes, and delictual claims with precision and aggression when necessary.",
    icon: 'Scale',
    features: ['High Court & Magistrate\'s Court Litigation', 'Contractual Disputes', 'Debt Collection', 'Interdicts & Urgent Applications'],
  },
  {
    slug: 'family',
    title: 'Family Law',
    description: 'Compassionate and discreet legal support for sensitive family matters. We prioritize the best interests of children and fair financial settlements in divorce proceedings.',
    icon: 'Heart',
    features: ['Divorce Proceedings (Contested & Uncontested)', 'Child Custody & Maintenance', 'Antinuptial Contracts', 'Protection Orders'],
  },
  {
    slug: 'commercial',
    title: 'Commercial Law',
    description: 'Strategic legal advice for South African businesses. From company registration to complex mergers and compliance, we ensure your business is legally sound.',
    icon: 'Briefcase',
    features: ['Company Registration & Structuring', 'Shareholders Agreements', 'Commercial Contracts', 'Business Rescue & Insolvency'],
  },
  {
    slug: 'property',
    title: 'Property Law',
    description: 'Comprehensive conveyancing and property law services. We assist with residential and commercial transfers, lease agreements, and eviction proceedings.',
    icon: 'Home',
    features: ['Property Transfers (Conveyancing)', 'Lease Agreements', 'Eviction Orders (PIE Act)', 'Sectional Title Disputes'],
  },
  {
    slug: 'personal-injury',
    title: 'Personal Injury',
    description: 'Dedicated support for victims of negligence. We fight for maximum compensation in Road Accident Fund (RAF) claims and medical malpractice cases.',
    icon: 'AlertCircle',
    features: ['Road Accident Fund (RAF) Claims', 'Medical Negligence', 'Public Liability Claims', 'Dog Bite Claims'],
  },
  {
    slug: 'criminal',
    title: 'Criminal Law',
    description: 'Defending your rights in criminal proceedings. Our experienced attorneys provide 24/7 bail support and expert trial defense.',
    icon: 'Gavel',
    features: ['24/7 Bail Applications', 'Criminal Trials', 'Diversion Representations', 'Expungement of Criminal Records'],
  },
]

const attorneys = [
  {
    slug: 'marius-roets',
    name: 'Marius Roets',
    role: 'Senior Partner',
    bio: 'Marius Roets is a founding partner with over 30 years of experience in Civil Litigation and Commercial Law. Known for his strategic approach in the High Court, he has successfully represented high-profile corporate clients and individuals alike.',
    qualifications: ['B.Proc (University of Pretoria)', 'Admitted Attorney of the High Court (1990)', 'Right of Appearance in High Court'],
    specialties: ['Civil Litigation', 'Commercial Law'],
    image: '/assets/team/marius-placeholder.jpg',
    email: 'marius@rvrinc.co.za',
    is_partner: true,
  },
  {
    slug: 'johan-van-rensburg',
    name: 'Johan van Rensburg',
    role: 'Partner',
    bio: "Johan specializes in Family Law and Property disputes. With a reputation for fair but firm negotiation, leads the firm's Family Law department.",
    qualifications: ['LLB (University of Stellenbosch)', 'Admitted Attorney & Conveyancer (1995)'],
    specialties: ['Family Law', 'Property Law'],
    image: '/assets/team/johan-placeholder.jpg',
    email: 'johan@rvrinc.co.za',
    is_partner: true,
  },
  {
    slug: 'sarah-nkosi',
    name: 'Sarah Nkosi',
    role: 'Associate',
    bio: 'Sarah is a rising star in Personal Injury and Labour Law. Her dedication to client justice has resulted in numerous successful RAF settlements.',
    qualifications: ['LLB (Wits University)', 'Admitted Attorney (2020)'],
    specialties: ['Personal Injury', 'Labour Law'],
    image: '/assets/team/sarah-placeholder.jpg',
    email: 'sarah@rvrinc.co.za',
    is_partner: false,
  },
]

async function seed() {
  console.log('=== Seeding RVR Inc Database ===\n')

  // Seed practice areas
  console.log('Seeding practice areas...')
  for (const pa of practiceAreas) {
    const { data, error } = await supabase
      .from('practice_areas')
      .upsert(pa, { onConflict: 'slug' })
      .select('id, title')
      .single()

    if (error) {
      console.error(`  ${pa.slug}: FAILED - ${error.message}`)
    } else {
      console.log(`  ${pa.slug}: OK (id: ${data.id})`)
    }
  }

  // Seed attorneys
  console.log('\nSeeding attorneys...')
  for (const atty of attorneys) {
    const { data, error } = await supabase
      .from('attorneys')
      .upsert(atty, { onConflict: 'slug' })
      .select('id, name')
      .single()

    if (error) {
      console.error(`  ${atty.slug}: FAILED - ${error.message}`)
    } else {
      console.log(`  ${atty.slug}: OK (id: ${data.id})`)
    }
  }

  // Verify
  console.log('\n=== Verification ===')
  const { data: paCount } = await supabase.from('practice_areas').select('*', { count: 'exact', head: true })
  const { data: attyCount } = await supabase.from('attorneys').select('*', { count: 'exact', head: true })
  console.log(`  practice_areas: ${paCount.count || 0} rows`)
  console.log(`  attorneys: ${attyCount.count || 0} rows`)

  console.log('\n=== Seed complete ===')
}

seed().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})
