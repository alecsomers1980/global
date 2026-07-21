import { createClient } from "@supabase/supabase-js";

/** Anon client with NO cookies — for public storefront reads (RLS allows anon
 *  select). Safe in generateStaticParams / build time where there is no request
 *  context, unlike the cookie-based server client. */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
