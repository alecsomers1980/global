import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kfkhkoeobxblhyygqwoh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtma2hrb2VvYnhibGh5eWdxd29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzk1ODQsImV4cCI6MjA4OTUxNTU4NH0.cNztvOB9KWFORCz4T4EB5XC-7PxVZJT3epMHq-7cUkE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: staff, error } = await supabase.from('staff').select('id, name')
  if (error) {
    console.error(error)
    return
  }

  const seen = new Set()
  const duplicates = []

  for (const member of staff) {
    if (seen.has(member.name)) {
      duplicates.push(member.id)
    } else {
      seen.add(member.name)
    }
  }

  if (duplicates.length > 0) {
    const { error: delError } = await supabase.from('staff').delete().in('id', duplicates)
    if (delError) console.error(delError)
    else console.log(`Deleted ${duplicates.length} duplicate staff members.`)
  } else {
    console.log('No duplicates found.')
  }
}

run()
