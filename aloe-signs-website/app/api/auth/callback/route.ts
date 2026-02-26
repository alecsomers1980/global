import { createServerSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Supabase calls this URL after a user clicks the email confirmation link.
// It exchanges the code for a session and redirects to the upload portal.
export async function GET(req: NextRequest) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/portal/upload';

    if (code) {
        const supabase = await createServerSupabase();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Something went wrong
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
}
