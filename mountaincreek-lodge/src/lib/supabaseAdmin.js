// Server-only Supabase client — uses the service role key, which bypasses
// RLS. Import this ONLY from API route handlers (app/api/**/route.js),
// never from a "use client" component or anything shipped to the browser.
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
