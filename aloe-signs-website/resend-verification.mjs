import { createClient } from "@supabase/supabase-js";
import nodemailer from 'nodemailer';

const supabaseUrl = "https://lsvqqnfpikamtovursxy.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdnFxbmZwaWthbXRvdnVyc3h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEwNTAwMSwiZXhwIjoyMDg3NjgxMDAxfQ.YUtcg2Jyli5GG5Nq8xBg1CQiCdJk3arQQuxNK0v_pv8";

const smtpHost = "smtp.aloesigns.co.za";
const smtpPort = 587;
const smtpUser = "shop@aloesigns.co.za";
const smtpPass = "8w54a60973E6hG";

const supa = createClient(supabaseUrl, serviceRoleKey);
const transporter = nodemailer.createTransport({
    host: smtpHost, port: smtpPort, secure: false,
    auth: { user: smtpUser, pass: smtpPass },
});

async function resendVerification() {
    const email = "alecs@precisionmedia.co.za";
    const fullName = "Edward Alec Somers";

    console.log(`Resending verification to ${email}...`);

    // 1. Generate new link
    const siteUrl = 'https://aloe-signs-website.vercel.app';
    const { data: linkData, error: linkError } = await supa.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: { redirectTo: `${siteUrl}/api/auth/callback` }
    });

    if (linkError) {
        console.error("Link generation error:", linkError);
        return;
    }

    const link = linkData.properties.action_link;

    // 2. Send email
    const body = `
        <div style="background-color:#ffffff;padding:48px 40px;border-radius:16px;border:1px solid #e2e8f0;font-family:sans-serif;">
            <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:700;color:#1e293b;text-align:center;">Welcome back to Aloe Signs!</h1>
            <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#475569;text-align:center;">Hi ${fullName}, please confirm your email address to activate your account.</p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="${link}" style="display:inline-block;background-color:#84cc16;color:#1a1a1a;font-weight:700;padding:16px 40px;text-decoration:none;border-radius:12px;font-size:16px;">Confirm Email Address</a>
            </div>
            
            <p style="margin:32px 0 0 0;font-size:14px;line-height:1.6;color:#94a3b8;text-align:center;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="margin:8px 0 0 0;font-size:13px;color:#84cc16;text-align:center;word-break:break-all;">${link}</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Aloe Signs" <${smtpUser}>`,
            to: email,
            subject: 'Confirm your Aloe Signs account',
            html: body
        });
        console.log("Verification email resent successfully!");
    } catch (error) {
        console.error("Email sending FAILED:", error);
    }
}

resendVerification();
