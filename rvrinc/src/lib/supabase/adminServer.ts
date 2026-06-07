import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
export const createClient = () => {
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
