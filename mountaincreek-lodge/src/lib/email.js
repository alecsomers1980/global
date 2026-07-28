import "server-only";
import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountaincreeklodge.vercel.app";

export async function sendPasswordResetEmail(toEmail, token) {
  const resend = getResend();
  if (!resend) {
    console.log("Resend not configured, skipping password reset email.");
    return;
  }

  const resetUrl = `${SITE_URL}/admin/reset?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "Reset your Mountain Creek Lodge admin password",
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px;">
        <h1 style="color:#C07750;">Mountain Creek Lodge Admin</h1>
        <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="text-align:center; margin:30px 0;">
          <a href="${resetUrl}" style="display:inline-block; background:#C07750; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Reset password</a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
