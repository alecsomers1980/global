// Test script: sends the new verification email design to a test address
// Run with: node scripts/send-test-verification.mjs

import nodemailer from 'nodemailer';

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const brand = {
    green: '#84cc16',
    greenDark: '#65a30d',
    greenLight: '#ecfccb',
    charcoal: '#141414',
    white: '#ffffff',
    offWhite: '#f9fafb',
    border: '#e5e7eb',
    textDark: '#111827',
    textMid: '#374151',
    textMuted: '#9ca3af',
    textLight: '#d1d5db',
    blue: '#3b82f6',
};

const SITE_URL = 'https://aloesigns.co.za';
const LOGO_URL = `${SITE_URL}/aloe-logo.png`;

// ─── Template ─────────────────────────────────────────────────────────────────
function buildEmailHtml(title, body, preview = '') {
    const preheaderHtml = preview
        ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f9fafb;mso-hide:all;">${preview}&zwnj;&nbsp;</div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { margin:0; padding:0; background-color:#f0f0f0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
    a { color: ${brand.green}; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-pad { padding: 32px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;">
  ${preheaderHtml}
  <div style="background-color:#f0f0f0;padding:40px 16px;">

    <table align="center" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:0 auto;width:600px;max-width:600px;">
      <!-- HEADER -->
      <tr>
        <td style="background-color:${brand.charcoal};border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid ${brand.green};">
          <a href="${SITE_URL}" style="text-decoration:none;display:block;">
            <img src="${LOGO_URL}" alt="Aloe Signs" width="160" style="display:block;height:auto;margin:0 auto;max-width:160px;"
              onerror="this.style.display='none';document.getElementById('logo-fallback').style.display='block';" />
            <span id="logo-fallback" style="display:none;color:${brand.green};font-size:22px;font-weight:800;letter-spacing:2px;">ALOE SIGNS</span>
          </a>
        </td>
      </tr>

      <!-- BODY CARD -->
      <tr>
        <td class="mobile-pad" style="background-color:${brand.white};padding:48px 48px 40px;border-left:1px solid ${brand.border};border-right:1px solid ${brand.border};">
          ${body}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color:${brand.charcoal};border-radius:0 0 16px 16px;padding:32px 40px;text-align:center;border-top:3px solid ${brand.green};">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${brand.green};letter-spacing:0.5px;text-transform:uppercase;">Aloe Signs</p>
          <p style="margin:0 0 4px;font-size:13px;color:${brand.textLight};">Products that build businesses.</p>
          <p style="margin:0 0 16px;font-size:13px;color:${brand.textMuted};">
            <a href="mailto:team@aloesigns.co.za" style="color:${brand.green};text-decoration:none;">team@aloesigns.co.za</a>
            &nbsp;·&nbsp;
            <span style="color:${brand.textLight};">011 693 2600</span>
          </p>
          <p style="margin:0;font-size:12px;color:#4b5563;">
            © ${new Date().getFullYear()} Aloe Signs. All rights reserved.
            &nbsp;·&nbsp;
            <a href="${SITE_URL}" style="color:#4b5563;text-decoration:underline;">aloesigns.co.za</a>
          </p>
        </td>
      </tr>
    </table>

    <!-- BELOW CARD DISCLAIMER -->
    <table align="center" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:24px auto 0;max-width:600px;">
      <tr>
        <td style="text-align:center;padding:0 16px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">You received this email because you have an account with Aloe Signs. If this wasn't you, please ignore this email.</p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;
}

// ─── Verification Email Body ───────────────────────────────────────────────────
const fullName = 'Alec Somers';
const firstName = 'Alec';
const verifyLink = `${SITE_URL}/auth/verify?token=PREVIEW_TOKEN_123&type=email`;

const body = `
  <!-- Icon -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">✉️</div>
  </div>

  <!-- Headline -->
  <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${brand.textDark};text-align:center;letter-spacing:-0.5px;line-height:1.2;">Verify your email<br>address</h1>
  <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
    Hi <strong style="color:${brand.textDark};">${firstName}</strong> 👋 — welcome to Aloe Signs! You're almost in. Tap the button below to confirm your email address and activate your Client Portal account.
  </p>

  <!-- CTA Button -->
  <div style="text-align:center;margin:0 0 32px;">
    <table cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:10px;background-color:${brand.green};box-shadow:0 4px 20px 0 rgba(132,204,22,0.4);">
          <a href="${verifyLink}" style="display:inline-block;background-color:${brand.green};color:${brand.charcoal};font-size:16px;font-weight:700;padding:16px 40px;text-decoration:none;border-radius:10px;font-family:Inter,sans-serif;">Verify My Email Address</a>
        </td>
      </tr>
    </table>
  </div>

  <!-- Fallback link -->
  <p style="margin:24px 0 4px;font-size:13px;color:${brand.textMuted};text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
  <p style="margin:0;font-size:12px;color:${brand.green};text-align:center;word-break:break-all;">${verifyLink}</p>

  <!-- Divider -->
  <div style="height:1px;background-color:${brand.border};margin:32px 0;"></div>

  <!-- What's Next -->
  <div style="margin:32px 0 16px;padding-left:14px;border-left:4px solid ${brand.green};">
    <p style="margin:0;font-size:13px;font-weight:700;color:${brand.green};letter-spacing:1px;text-transform:uppercase;">What happens next?</p>
  </div>
  <table cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:24px;">
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;">
        <div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">1</div>
      </td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Click the button above to verify your email</td>
    </tr>
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;">
        <div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">2</div>
      </td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Log into your Aloe Signs Client Portal</td>
    </tr>
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;">
        <div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">3</div>
      </td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Submit jobs, review proofs & track your signage projects</td>
    </tr>
  </table>

  <!-- Security Notice -->
  <div style="background-color:#eff6ff;border-left:4px solid ${brand.blue};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
    <p style="margin:0;font-size:14px;line-height:1.6;color:#1d4ed8;">This link expires in <strong>24 hours</strong>. If you didn't create an Aloe Signs account, you can safely ignore this email — no action is required.</p>
  </div>
`;

// ─── Send ──────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp.aloesigns.co.za',
    port: 465,
    secure: true,
    auth: {
        user: 'shop@aloesigns.co.za',
        pass: 'z425v66q4R1F02',
    },
});

try {
    console.log('📧 Sending verification email preview...');
    await transporter.sendMail({
        from: '"Aloe Signs" <shop@aloesigns.co.za>',
        to: 'alecs@precisionmedia.co.za',
        subject: 'Action Required: Verify your Aloe Signs account',
        text: `Hi ${firstName}, welcome to Aloe Signs! Please verify your email by visiting: ${verifyLink}`,
        html: buildEmailHtml(
            'Verify your Aloe Signs account',
            body,
            `Hi ${firstName}, please verify your email to activate your Aloe Signs account.`
        ),
    });
    console.log('✅ Email sent successfully to alecs@precisionmedia.co.za');
} catch (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
}
