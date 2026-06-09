import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctfwxbrjyxjcdsrbdxxz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDY5NjUsImV4cCI6MjA5MzU4Mjk2NX0.UUDCqnonRvMo3UPKcy_fesnhFL0eZ6gaxe20x7km0S0'

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
