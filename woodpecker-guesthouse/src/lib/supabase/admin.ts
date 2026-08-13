import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** True once the service-role key + Supabase URL are both set. Callers with
 *  no user session to gate on (crons) must check this before calling
 *  createAdminClient() — confirmed by running the blog crons locally without
 *  Supabase configured: the unguarded call threw outside any try/catch and
 *  Next returned an empty-body 500 instead of the route's own JSON error. */
export function supabaseAdminConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Service-role client — bypasses RLS entirely. Only ever import this from
 *  API routes that do their own auth check first (see the upload route in
 *  Task 9), or that check supabaseAdminConfigured() first (see the blog
 *  crons, which have no user session to gate on). Never expose to a Client
 *  Component. Throws synchronously when unconfigured — same failure mode
 *  documented for createClient()/createServerClient()/createBrowserClient(). */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}