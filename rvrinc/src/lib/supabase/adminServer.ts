import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createPlainClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function cookieHandlers(cookieStore: ReturnType<typeof cookies>) {
    return {
        get(name: string) {
            return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
            try {
                cookieStore.set({ name, value, ...options })
            } catch (error) {
                // Called from Server Component — middleware handles refresh
            }
        },
        remove(name: string, options: CookieOptions) {
            try {
                cookieStore.set({ name, value: '', ...options })
            } catch (error) {
                // Called from Server Component — middleware handles refresh
            }
        },
    }
}

// Admin DB client — uses service_role key to bypass RLS for all DB operations.
// Do NOT use this for auth.getUser() — Supabase Auth rejects the service_role key.
export const createAdminClient = () => {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: cookieHandlers(cookieStore) }
    )
}

// Auth client — uses anon key, required for auth.getUser() to validate sessions.
// Use this ONLY for auth.getUser(); use createClient() for all DB queries.
export const createAuthClient = () => {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: cookieHandlers(cookieStore) }
    )
}

// Plain service-role client — no cookies, no SSR session handling.
// Unlike createClient() (which uses @supabase/ssr and still routes through
// cookie-based middleware), this bypasses RLS at the Postgres policy level
// unconditionally because it never attaches any session context to requests.
// Use this for write operations where you need guaranteed RLS bypass.
export const createServiceClient = () => {
    return createPlainClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}
