import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client — bypasses RLS entirely. Only ever import this from
 *  API routes that do their own auth check first (see the upload route in
 *  Task 9). Never expose to a Client Component. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}