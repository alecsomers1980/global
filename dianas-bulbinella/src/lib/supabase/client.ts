import { createBrowserClient } from "@supabase/ssr";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Browser Supabase client (anon key, RLS-enforced). For client components.
 *
 * `persist` drives "keep me signed in":
 *  - true  → cookie lives 30 days, survives a browser restart
 *  - false → session cookie, cleared when the browser closes
 * Omitted (undefined) leaves the existing cookie lifetime alone — what every
 * page other than the login screen wants.
 */
export function createClient(persist?: boolean) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    persist === undefined
      ? undefined
      : { cookieOptions: { maxAge: persist ? THIRTY_DAYS : undefined } }
  );
}
