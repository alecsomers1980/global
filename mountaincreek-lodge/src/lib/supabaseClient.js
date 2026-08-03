// Browser-safe Supabase client — uses the public anon key.
// Reads are allowed for everyone via RLS; writes are NOT allowed with this
// client (see src/lib/supabaseAdmin.js, used only inside API routes).
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
