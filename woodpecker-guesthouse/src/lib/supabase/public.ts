import { createClient } from "@supabase/supabase-js";

/** True once both public Supabase env vars are set. Guards every data-layer
 *  function below so an unconfigured project (no Supabase provisioned yet)
 *  renders an honest empty state instead of throwing "supabaseUrl is
 *  required" at build/request time. */
export function supabasePublicConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Anon client, no cookies — public reads only (RLS enforces "published"
 *  filtering server-side regardless of what this client requests). Safe to
 *  call from Server Components and build-time generateStaticParams alike.
 *  Only call after checking supabasePublicConfigured(). */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}