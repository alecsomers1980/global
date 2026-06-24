import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

// Exchanges the one-time code from an email link (e.g. password recovery) for a
// session cookie, then redirects to `next` (default the dashboard).
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/dashboard'

    if (code) {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/login?error=reset_link`)
}
