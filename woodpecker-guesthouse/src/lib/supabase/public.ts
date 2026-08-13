import { createClient } from "@supabase/supabase-js";

/** Anon client, no cookies — public reads only (RLS enforces "published"
 *  filtering server-side regardless of what this client requests). Safe to
 *  call from Server Components and build-time generateStaticParams alike. */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}