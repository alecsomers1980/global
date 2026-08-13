import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** True once both public Supabase env vars are set. */
export function supabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Server-side Supabase client (RLS-enforced, uses the anon key + the user's
 *  session cookies). Next 16: cookies() is async.
 *
 *  Returns null when unconfigured instead of throwing — createServerClient()
 *  throws synchronously otherwise, confirmed by running admin/layout.tsx
 *  (which every /admin/* page inherits, including /admin/login) without env
 *  vars set: it 500'd the login page itself. Every caller must handle null. */
export async function createClient() {
  if (!supabaseConfigured()) return null;
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
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — safe to ignore; proxy.ts refreshes.
          }
        },
      },
    }
  );
}