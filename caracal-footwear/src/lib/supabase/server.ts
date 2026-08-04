import { createClient } from '@supabase/supabase-js';

/**
 * Read-only anon client for server components. The catalogue tables are
 * public behind RLS, so the anon key is sufficient -- the service-role key
 * must never reach this path.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy .env.local.example to .env.local and fill them in.',
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
