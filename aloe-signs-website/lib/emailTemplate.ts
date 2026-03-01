/**
 * Aloe Signs — Shared Email Template System
 *
 * A single, premium base layout used by every transactional email sent
 * from the Aloe Signs website. Import the helpers you need and compose
 * beautiful, consistent emails in minutes.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za';
const LOGO_URL = `${SITE_URL}/aloe-logo.png`;

// ─── Brand Tokens ──────────────────────────────────────────────────────────────

export const brand = {
  green: '#84cc16',
  greenDark: '#65a30d',
  greenLight: '#ecfccb',
  charcoal: '#141414',
  charcoalLight: '#1e1e1e',
  white: '#ffffff',
  offWhite: '#f9fafb',
  border: '#e5e7eb',
  textDark: '#111827',
  textMid: '#374151',
  textMuted: '#9ca3af',
  textLight: '#d1d5db',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  emerald: '#10b981',
};

// ─── Master HTML Wrapper ───────────────────────────────────────────────────────

/**
 * Wraps any email body HTML in the full Aloe Signs master template.
 * @param title   - Used in the <title> tag
 * @param body    - Inner HTML inserted into the white content card
 * @param preview - Optional preheader text (shown in inbox preview, invisible in body)
 */
export function buildEmailHtml(title: string, body: string, preview = ''): string {
  const preheaderHtml = preview
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f9fafb;line-height:1px;max-width:0px;opacity:0;">${preview}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .stack-column-center { text-align: center !important; }
      .mobile-padding { padding: 32px 20px !important; }
    }
  </style>
</head>
<body id="body" style="margin:0;padding:0;background-color:#f0f0f0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheaderHtml}

  <div role="article" aria-roledescription="email" aria-label="${title}" lang="en" style="background-color:#f0f0f0;padding:40px 16px;">

    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:0 auto;width:600px;max-width:600px;">

      <!-- ═══ HEADER ═══ -->
      <tr>
        <td style="background-color:${brand.charcoal};border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid ${brand.green};">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" alt="Aloe Signs" width="160" style="display:block;height:auto;margin:0 auto;max-width:160px;" />
          </a>
        </td>
      </tr>

      <!-- ═══ BODY CARD ═══ -->
      <tr>
        <td class="mobile-padding" style="background-color:${brand.white};padding:48px 48px 40px;border-left:1px solid ${brand.border};border-right:1px solid ${brand.border};">
          ${body}
        </td>
      </tr>

      <!-- ═══ FOOTER ═══ -->
      <tr>
        <td style="background-color:${brand.charcoal};border-radius:0 0 16px 16px;padding:32px 40px;text-align:center;border-top:3px solid ${brand.green};">
          <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${brand.green};letter-spacing:0.5px;text-transform:uppercase;">Aloe Signs</p>
          <p style="margin:0 0 4px 0;font-size:13px;color:${brand.textLight};">Products that build businesses.</p>
          <p style="margin:0 0 16px 0;font-size:13px;color:${brand.textMuted};">
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

    <!-- Below-card disclaimer -->
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:24px auto 0;width:600px;max-width:600px;">
      <tr>
        <td style="text-align:center;padding:0 16px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">You received this email because you have an account or placed an order with Aloe Signs. If this wasn't you, please ignore this email.</p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;
}

// ─── Reusable Component Builders ──────────────────────────────────────────────

/**
 * Renders a full-width lime-green CTA button.
 */
export function buildButton(label: string, url: string, color = brand.green): string {
  const textColor = color === brand.green ? brand.charcoal : brand.white;
  const glowColor = color === brand.green ? 'rgba(132,204,22,0.4)' : 'rgba(0,0,0,0.2)';
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:10px;background-color:${color};box-shadow:0 4px 20px 0 ${glowColor};">
          <a href="${url}" target="_blank" style="display:inline-block;background-color:${color};color:${textColor};font-size:16px;font-weight:700;line-height:1;padding:16px 40px;text-decoration:none;border-radius:10px;white-space:nowrap;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * Renders a section heading with a lime-green left border accent.
 */
export function buildSectionHeading(heading: string): string {
  return `
    <div style="margin:32px 0 16px;padding-left:14px;border-left:4px solid ${brand.green};">
      <p style="margin:0;font-size:13px;font-weight:700;color:${brand.green};letter-spacing:1px;text-transform:uppercase;">${heading}</p>
    </div>`;
}

/**
 * Renders a single two-column detail row (label | value).
 * Pass rows to buildDetailsTable.
 */
export function buildInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:11px 16px;font-size:13px;font-weight:600;color:${brand.textMuted};white-space:nowrap;background-color:${brand.offWhite};border-bottom:1px solid ${brand.border};width:140px;">${label}</td>
      <td style="padding:11px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};">${value}</td>
    </tr>`;
}

/**
 * Wraps rows (from buildInfoRow) in a styled table.
 */
export function buildDetailsTable(rows: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${brand.border};border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${rows}
    </table>`;
}

/**
 * Renders a highlighted info/alert box.
 */
export function buildInfoBox(content: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const colors = {
    info: { bg: '#eff6ff', border: brand.blue, text: '#1d4ed8' },
    success: { bg: brand.greenLight, border: brand.green, text: brand.greenDark },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fef2f2', border: brand.red, text: '#991b1b' },
  };
  const c = colors[type];
  return `
    <div style="background-color:${c.bg};border-left:4px solid ${c.border};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:${c.text};line-height:1.6;">${content}</p>
    </div>`;
}

/**
 * Renders a status badge pill (e.g. for order status).
 */
export function buildStatusBadge(label: string, color: string): string {
  const hex = color.replace('#', '');
  return `<span style="display:inline-block;background-color:${color};color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>`;
}

/**
 * Renders a horizontal rule divider.
 */
export function buildDivider(): string {
  return `<div style="height:1px;background-color:${brand.border};margin:32px 0;"></div>`;
}

/**
 * Renders the standard fallback link section for verification-type emails.
 */
export function buildFallbackLink(url: string): string {
  return `
    <p style="margin:24px 0 4px;font-size:13px;color:${brand.textMuted};text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="margin:0;font-size:12px;color:${brand.green};text-align:center;word-break:break-all;">${url}</p>`;
}
