import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client -- BYPASSES ROW LEVEL SECURITY.
 *
 * Server-only: API routes that write orders/stock, and later the Phase 3
 * admin. NEVER import this into a client component or a file that could end
 * up in a client bundle -- the key it reads has no RLS to fall back on.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set them in .env.local.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
