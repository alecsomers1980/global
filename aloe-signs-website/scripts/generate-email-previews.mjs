// Preview generator script — run with: node scripts/generate-email-previews.mjs
// Open the generated HTML files in your browser to see how each email looks.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'email-previews');
fs.mkdirSync(outDir, { recursive: true });

// ─── Brand Tokens (mirrored from emailTemplate.ts) ──────────────────────────

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
    purple: '#8b5cf6',
    emerald: '#10b981',
    red: '#ef4444',
};

const SITE_URL = 'https://aloesigns.co.za';
const LOGO_URL = `${SITE_URL}/aloe-logo.png`;

// ─── Master Template ─────────────────────────────────────────────────────────

function buildEmailHtml(title, body, preview = '') {
    const preheaderHtml = preview
        ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f9fafb;">${preview}</div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { margin:0;padding:0;background-color:#f0f0f0;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheaderHtml}
  <div style="background-color:#f0f0f0;padding:40px 16px;">
    <table align="center" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;width:600px;max-width:600px;">
      <tr>
        <td style="background-color:${brand.charcoal};border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid ${brand.green};">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" alt="Aloe Signs" width="160" style="display:block;height:auto;margin:0 auto;max-width:160px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
            <span style="display:none;color:${brand.green};font-size:24px;font-weight:800;letter-spacing:2px;">ALOE SIGNS</span>
          </a>
        </td>
      </tr>
      <tr>
        <td style="background-color:${brand.white};padding:48px 48px 40px;border-left:1px solid ${brand.border};border-right:1px solid ${brand.border};">
          ${body}
        </td>
      </tr>
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
    <table align="center" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:24px auto 0;width:600px;">
      <tr>
        <td style="text-align:center;padding:0 16px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">You received this email because you have an account or placed an order with Aloe Signs.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function buildButton(label, url, color = brand.green) {
    const textColor = color === brand.green ? brand.charcoal : '#fff';
    return `<table cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;"><tr><td style="border-radius:10px;background-color:${color};box-shadow:0 4px 20px 0 rgba(132,204,22,0.4);"><a href="${url}" style="display:inline-block;background-color:${color};color:${textColor};font-size:16px;font-weight:700;padding:16px 40px;text-decoration:none;border-radius:10px;">${label}</a></td></tr></table>`;
}

function buildSectionHeading(h) {
    return `<div style="margin:32px 0 16px;padding-left:14px;border-left:4px solid ${brand.green};"><p style="margin:0;font-size:13px;font-weight:700;color:${brand.green};letter-spacing:1px;text-transform:uppercase;">${h}</p></div>`;
}

function buildInfoRow(label, value) {
    return `<tr><td style="padding:11px 16px;font-size:13px;font-weight:600;color:${brand.textMuted};white-space:nowrap;background-color:${brand.offWhite};border-bottom:1px solid ${brand.border};width:140px;">${label}</td><td style="padding:11px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};">${value}</td></tr>`;
}

function buildDetailsTable(rows) {
    return `<table cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${brand.border};border-radius:10px;overflow:hidden;margin-bottom:8px;">${rows}</table>`;
}

function buildInfoBox(content, type = 'info') {
    const colors = {
        info: { bg: '#eff6ff', border: brand.blue },
        success: { bg: brand.greenLight, border: brand.green },
        warning: { bg: '#fffbeb', border: '#f59e0b' },
        error: { bg: '#fef2f2', border: brand.red },
    };
    const c = colors[type];
    return `<div style="background-color:${c.bg};border-left:4px solid ${c.border};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;"><p style="margin:0;font-size:14px;line-height:1.6;">${content}</p></div>`;
}

function buildFallbackLink(url) {
    return `<p style="margin:24px 0 4px;font-size:13px;color:${brand.textMuted};text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p><p style="margin:0;font-size:12px;color:${brand.green};text-align:center;word-break:break-all;">${url}</p>`;
}

function buildDivider() {
    return `<div style="height:1px;background-color:${brand.border};margin:32px 0;"></div>`;
}

// ─── 1. Email Verification ────────────────────────────────────────────────────

const verificationLink = `${SITE_URL}/auth/verify?token=abc123preview&type=email`;

const verificationBody = `
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">✉️</div>
  </div>
  <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${brand.textDark};text-align:center;letter-spacing:-0.5px;line-height:1.2;">Verify your email<br>address</h1>
  <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
    Hi <strong style="color:${brand.textDark};">Sarah</strong> 👋 — welcome to Aloe Signs! You're almost in. Tap the button below to confirm your email address and activate your Client Portal account.
  </p>
  <div style="text-align:center;margin:0 0 32px;">
    ${buildButton('Verify My Email Address', verificationLink)}
  </div>
  ${buildFallbackLink(verificationLink)}
  ${buildDivider()}
  ${buildSectionHeading("What happens next?")}
  <table cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:24px;">
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;"><div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">1</div></td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Click the button above to verify your email</td>
    </tr>
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;"><div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">2</div></td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Log into your Aloe Signs Client Portal</td>
    </tr>
    <tr>
      <td style="padding:8px 0;width:32px;vertical-align:top;"><div style="width:24px;height:24px;background-color:${brand.greenLight};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${brand.greenDark};">3</div></td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:${brand.textMid};line-height:1.5;">Submit jobs, review proofs & track your signage projects</td>
    </tr>
  </table>
  ${buildInfoBox('This link expires in <strong>24 hours</strong>. If you didn\'t create an Aloe Signs account, you can safely ignore this email.', 'info')}
`;

// ─── 2. Order Confirmation ────────────────────────────────────────────────────

const orderBody = `
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">🎉</div>
  </div>
  <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">Thank you for your order!</h1>
  <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
    Hi <strong style="color:${brand.textDark};">John</strong> — your order has been received and is being processed. We'll keep you updated every step of the way.
  </p>
  ${buildInfoBox('Your Order Number is <strong style="font-size:16px;">ALO-20260301-0042</strong>. Keep this handy to track your order.', 'success')}
  ${buildSectionHeading('Order Summary')}
  <table cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${brand.border};border-radius:10px;overflow:hidden;margin-bottom:8px;">
    <thead>
      <tr style="background-color:${brand.offWhite};">
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Item</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Price</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:14px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};"><strong>Outdoor Vinyl Banner</strong><br><span style="font-size:12px;color:${brand.textMuted};">2400mm × 900mm</span></td>
        <td style="padding:14px 16px;font-size:14px;color:${brand.textMid};text-align:center;border-bottom:1px solid ${brand.border};">2</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:600;color:${brand.textDark};text-align:right;border-bottom:1px solid ${brand.border};">R 1,200.00</td>
      </tr>
      <tr>
        <td style="padding:14px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};"><strong>A-Frame Pavement Sign</strong><br><span style="font-size:12px;color:${brand.textMuted};">Standard</span></td>
        <td style="padding:14px 16px;font-size:14px;color:${brand.textMid};text-align:center;border-bottom:1px solid ${brand.border};">1</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:600;color:${brand.textDark};text-align:right;border-bottom:1px solid ${brand.border};">R 850.00</td>
      </tr>
    </tbody>
    <tfoot style="background-color:${brand.offWhite};">
      <tr><td colspan="2" style="padding:12px 16px;font-size:14px;color:${brand.textMid};border-top:1px solid ${brand.border};text-align:right;">Subtotal</td><td style="padding:12px 16px;font-size:14px;font-weight:600;color:${brand.textDark};border-top:1px solid ${brand.border};text-align:right;">R 2,050.00</td></tr>
      <tr><td colspan="2" style="padding:12px 16px;font-size:14px;color:${brand.textMid};text-align:right;">Shipping</td><td style="padding:12px 16px;font-size:14px;font-weight:600;color:${brand.greenDark};text-align:right;">FREE</td></tr>
      <tr style="background-color:${brand.charcoal};"><td colspan="2" style="padding:14px 16px;font-size:16px;font-weight:700;color:${brand.white};text-align:right;">Total</td><td style="padding:14px 16px;font-size:18px;font-weight:800;color:${brand.green};text-align:right;">R 2,050.00</td></tr>
    </tfoot>
  </table>
  ${buildSectionHeading('Delivery Address')}
  ${buildDetailsTable([
    buildInfoRow('Street', '14 Oak Avenue'),
    buildInfoRow('City', 'Johannesburg'),
    buildInfoRow('Province', 'Gauteng'),
    buildInfoRow('Postal Code', '2001'),
].join(''))}
  <div style="text-align:center;margin-top:40px;">
    ${buildButton('Track My Order', `${SITE_URL}/order/track?q=ALO-20260301-0042`)}
  </div>
  ${buildInfoBox('Questions about your order? Reply to this email or call us on <strong>011 693 2600</strong>.', 'info')}
`;

// ─── 3. Order Status Update ───────────────────────────────────────────────────

const statusBody = `
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:72px;height:72px;border-radius:50%;line-height:72px;font-size:32px;background-color:${brand.offWhite};">🚚</div>
  </div>
  <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">Order Shipped</h1>
  <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
    Hi <strong style="color:${brand.textDark};">John</strong> — Great news — your order has been dispatched and is on its way to you!
  </p>
  <div style="text-align:center;margin:24px 0 32px;">
    <div style="display:inline-block;background-color:${brand.emerald};color:#fff;font-size:14px;font-weight:700;padding:10px 28px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;">SHIPPED</div>
  </div>
  ${buildSectionHeading('Order Details')}
  ${buildDetailsTable([
    buildInfoRow('Order Number', '<strong>ALO-20260301-0042</strong>'),
    buildInfoRow('Updated', '1 March 2026, 21:55'),
    buildInfoRow('Current Status', '<strong style="color:#10b981;text-transform:uppercase;">Shipped</strong>'),
].join(''))}
  <div style="text-align:center;margin-top:40px;">
    ${buildButton('View Order Details', `${SITE_URL}/order/track?q=ALO-20260301-0042`)}
  </div>
`;

// ─── 4. Proof Ready ───────────────────────────────────────────────────────────

const proofBody = `
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">🎨</div>
  </div>
  <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">Your proof is ready!</h1>
  <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
    Hi <strong style="color:${brand.textDark};">Sarah</strong> — your design proof is ready for review. Please log in to the Client Portal to approve or request changes.
  </p>
  ${buildSectionHeading('Proof Details')}
  ${buildDetailsTable(buildInfoRow('Proof Name', 'Outdoor Banner — Main Street Branch (Rev 1)'))}
  <div style="text-align:center;margin-top:32px;">
    ${buildButton('Review My Proof', `${SITE_URL}/portal/`)}
  </div>
  ${buildInfoBox('Please review and respond to your proof as soon as possible so we can proceed with production.', 'info')}
`;

// ─── Write Files ──────────────────────────────────────────────────────────────

const emails = [
    { name: '01-email-verification', title: 'Email Verification', body: verificationBody, preview: 'Hi Sarah, please verify your email to activate your Aloe Signs account.' },
    { name: '02-order-confirmation', title: 'Order Confirmation', body: orderBody, preview: 'Order #ALO-20260301-0042 confirmed — thank you!' },
    { name: '03-order-status-shipped', title: 'Order Status Update — Shipped', body: statusBody, preview: 'Your order #ALO-20260301-0042 has been shipped.' },
    { name: '04-proof-ready', title: 'Proof Ready for Review', body: proofBody, preview: 'Your design proof is ready for review.' },
];

emails.forEach(({ name, title, body, preview }) => {
    const html = buildEmailHtml(title, body, preview);
    const filePath = path.join(outDir, `${name}.html`);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ Generated: email-previews/${name}.html`);
});

console.log(`\n📧 All previews generated in: ${outDir}`);
console.log('Open any .html file in your browser to preview the email design.');
