import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { sendVerificationEmail } from '@/lib/portal-email';

export async function POST(req: NextRequest) {
    try {
        const { email, password, fullName, company, contactNumber } = await req.json();

        if (!email || !password || !fullName || !contactNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adminSupabase = createAdminSupabase();

        // 1. Create the user
        const { data: { user }, error: signUpError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: { full_name: fullName, company, contact_number: contactNumber }
        });

        if (signUpError) {
            return NextResponse.json({ error: signUpError.message }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // 2. Insert into profiles table (assuming it exists and matches the register logic)
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: fullName,
                email: email,
                company: company || null,
                contact_number: contactNumber,
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // We still proceed to send the email even if profile creation fails, 
            // but ideally this should be handled better.
        }

        // 3. Generate verification link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloe-signs-website.vercel.app';
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
            type: 'signup',
            email: email,
            password: password,
            options: { redirectTo: `${siteUrl}/api/auth/callback` }
        });

        if (linkError) {
            return NextResponse.json({ error: 'Failed to generate verification link' }, { status: 500 });
        }

        // 4. Send custom email
        try {
            await sendVerificationEmail(email, linkData.properties.action_link, fullName);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return NextResponse.json({ error: 'Account created but failed to send verification email. Please contact support.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Registration successful! Please check your email for the confirmation link.' });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred during registration' }, { status: 500 });
    }
}
