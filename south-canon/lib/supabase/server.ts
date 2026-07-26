import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Anonymous client. Reads only published rows (RLS). Use for public pages. */
export function createServerClient() {
  return createClient(url, anonKey, { auth: { persistSession: false } })
}

/** Service-role client. Bypasses RLS. Server-side admin only — never import into a client component. */
export function createServiceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
