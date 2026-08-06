import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side, cookie-aware Supabase client -- reads the signed-in admin's
 * session. Distinct from src/lib/supabase/server.ts (Phase 1), which is an
 * anon, cookie-less client for public catalogue reads and knows nothing
 * about sessions. Next 16: cookies() is async.
 */
export async function createSessionServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component -- safe to ignore; proxy.ts refreshes.
          }
        },
      },
    },
  );
}
