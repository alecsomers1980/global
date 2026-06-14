import { Resend } from 'resend'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = process.env.EMAIL_FROM || 'Bushbuckridge Directory <noreply@dbib.co.za>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || ''

const LOGO_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dbib.co.za') + '/logo.png'

function brandHeader(): string {
  return `
    <div style="background:#FFFFFF;padding:28px;text-align:center;border-bottom:4px solid #FFD700;border-radius:16px 16px 0 0">
      <img src="${LOGO_URL}" alt="Doing Business in Bushbuckridge" width="220" style="display:inline-block;max-width:220px;height:auto" />
    </div>
  `
}

function brandFooter(): string {
  return `
    <div style="background:#1B4332;padding:32px;text-align:center;font-family:Arial,Helvetica,sans-serif">
      <p style="color:#FFD700;font-weight:bold;font-size:13px;letter-spacing:1px;margin:0 0 6px">DOING BUSINESS IN BUSHBUCKRIDGE</p>
      <p style="color:#A7BBB1;font-size:13px;margin:0 0 4px">Bushbuckridge, Mpumalanga</p>
      <p style="color:#A7BBB1;font-size:13px;margin:0">info@dbib.co.za • dbib.co.za</p>
      <p style="color:#7d978c;font-size:11px;margin-top:14px;margin-bottom:0">This is an automated message from the Doing Business in Bushbuckridge directory.</p>
    </div>
  `
}

function wrap(content: string): string {
  return `
    <div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
        ${brandHeader()}
        <div style="padding:32px 40px;color:#2D3436;line-height:1.6;font-size:15px">${content}</div>
        ${brandFooter()}
      </div>
    </div>
  `
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#FFD700;color:#1B4332;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">${label}</a>`
}

export interface PaymentReceiptData {
  to: string
  businessName: string
  tier: string
  amount: string
  paymentRef: string
  portalUrl: string
}

export async function sendPaymentReceipt(data: PaymentReceiptData): Promise<boolean> {
  const resend = getResend()
  if (!resend || !ADMIN_EMAIL) {
    console.log('[email] Payment receipt skipped (not configured):', data.to)
    return false
  }

  const tierLabels: Record<string, string> = {
    basic: 'Basic Listing',
    'pro-lead': 'Pro Lead Package',
    'pro-business': 'Pro Business Listing',
  }
  const tierLabel = tierLabels[data.tier] || data.tier

  try {
    await resend.emails.send({
      from: FROM,
      to: [data.to],
      subject: `Payment Receipt — ${data.businessName}`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">Payment Confirmed</h2>
        <p>Thank you for listing <strong>${data.businessName}</strong> on the Bushbuckridge Community Directory.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#FAFAFA;border-radius:12px;overflow:hidden">
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Package</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${tierLabel}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Amount Paid</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.amount}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Reference</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.paymentRef}</td></tr>
        </table>
        <p>Your listing is now active. Visit your portal to manage your business profile and track performance.</p>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.portalUrl, 'Go to Your Portal')}
        </div>
      `),
    })
    console.log('[email] Payment receipt sent to:', data.to)
    return true
  } catch (e) {
    console.error('[email] Failed to send payment receipt:', e)
    return false
  }
}

export interface WelcomeEmailData {
  to: string
  businessName: string
  loginUrl: string
  portalUrl: string
  siteUrl: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const resend = getResend()
  if (!resend || !ADMIN_EMAIL) {
    console.log('[email] Welcome email skipped (not configured):', data.to)
    return false
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: [data.to],
      subject: `Welcome to the Bushbuckridge Community Directory — ${data.businessName}`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">Welcome, ${data.businessName}!</h2>
        <p>Your business is now listed on the <strong>Bushbuckridge Community Directory</strong> — the region's go-to platform for local services, jobs, and events.</p>
        <h3 style="color:#1B4332;margin-bottom:8px">What's Next?</h3>
        <ul style="padding-left:20px">
          <li style="margin-bottom:8px"><strong>Complete your profile</strong> — add photos, description, and contact details</li>
          <li style="margin-bottom:8px"><strong>Track performance</strong> — view profile visits, clicks, and leads</li>
          <li style="margin-bottom:8px"><strong>Upgrade anytime</strong> — unlock spotlight features and premium placement</li>
        </ul>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.portalUrl, 'Access Your Portal')}
        </div>
        <p style="font-size:14px;color:#6B7280">Log in at <a href="${data.loginUrl}" style="color:#1B4332">${data.loginUrl}</a> with the email address and password you chose during signup.</p>
      `),
    })
    console.log('[email] Welcome email sent to:', data.to)
    return true
  } catch (e) {
    console.error('[email] Failed to send welcome email:', e)
    return false
  }
}

export interface AdminSignupAlertData {
  businessName: string
  contactName: string
  email: string
  phone: string
  tier: string
  sector: string
  area: string
  adminUrl: string
}

export async function sendAdminSignupAlert(data: AdminSignupAlertData): Promise<boolean> {
  const resend = getResend()
  if (!resend || !ADMIN_EMAIL) {
    console.log('[email] Admin signup alert skipped (not configured)')
    return false
  }

  const tierLabels: Record<string, string> = {
    basic: 'Basic Listing',
    'pro-lead': 'Pro Lead Package',
    'pro-business': 'Pro Business Listing',
  }
  const tierLabel = tierLabels[data.tier] || data.tier

  try {
    await resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: `New Signup — ${data.businessName}`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">New Business Signup</h2>
        <p>A new business has signed up on the Bushbuckridge Community Directory.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#FAFAFA;border-radius:12px;overflow:hidden">
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Business</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.businessName}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Contact</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.contactName}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Email</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.email}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Phone</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.phone || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Package</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${tierLabel}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Sector</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.sector || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Area</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.area || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.adminUrl, 'View in Admin Panel')}
        </div>
      `),
    })
    console.log('[email] Admin signup alert sent to:', ADMIN_EMAIL)
    return true
  } catch (e) {
    console.error('[email] Failed to send admin signup alert:', e)
    return false
  }
}

export interface EnquiryNotificationData {
  type: string
  businessName: string
  contactPerson: string
  email: string
  phone: string
  details: string
}

export async function sendEnquiryNotification(data: EnquiryNotificationData): Promise<boolean> {
  const resend = getResend()
  if (!resend || !ADMIN_EMAIL) {
    console.log('[email] Enquiry notification skipped (not configured)')
    return false
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: `New Enquiry — ${data.businessName || data.contactPerson}`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">New Enquiry Received</h2>
        <p>A new enquiry has been submitted through the Bushbuckridge Community Directory.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#FAFAFA;border-radius:12px;overflow:hidden">
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Type</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.type}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Contact Person</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.contactPerson}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Business</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.businessName || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Email</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.email}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Phone</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.phone || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Details</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.details || '—'}</td></tr>
        </table>
      `),
    })
    console.log('[email] Enquiry notification sent to:', ADMIN_EMAIL)
    return true
  } catch (e) {
    console.error('[email] Failed to send enquiry notification:', e)
    return false
  }
}

export interface RenewalReminderData {
  to: string
  businessName: string
  tier: string
  amount: string
  expiresAt: Date
  daysUntilExpiry: 30 | 14 | 7 | 1
  renewUrl: string
}

const TIER_LABELS_RENEW: Record<string, string> = {
  basic: 'Basic Listing',
  'pro-lead': 'Pro Lead Package',
  'pro-business': 'Pro Business Listing',
}

function renewalCopy(days: 30 | 14 | 7 | 1) {
  switch (days) {
    case 30:
      return {
        subject: (b: string) => `Heads-up: ${b} listing renews in 30 days`,
        heading: 'Your listing renews in 30 days',
        urgency: 'You have plenty of time, but we wanted to give you advance notice so there are no surprises.',
        cta: 'Renew Early',
      }
    case 14:
      return {
        subject: (b: string) => `${b} listing renews in 2 weeks`,
        heading: 'Your listing renews in 2 weeks',
        urgency: 'A good time to renew so your listing keeps appearing in search results without interruption.',
        cta: 'Renew Now',
      }
    case 7:
      return {
        subject: (b: string) => `${b} listing expires in 7 days — renew now`,
        heading: 'Your listing expires in 7 days',
        urgency: 'Renew this week to avoid your listing being hidden from customers searching the directory.',
        cta: 'Renew My Listing',
      }
    case 1:
      return {
        subject: (b: string) => `Final reminder: ${b} listing expires tomorrow`,
        heading: 'Your listing expires tomorrow',
        urgency: 'Your business listing will be hidden from search results unless renewed today.',
        cta: 'Renew Before Expiry',
      }
  }
}

export async function sendRenewalReminder(data: RenewalReminderData): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log('[email] Renewal reminder skipped (not configured):', data.to)
    return false
  }

  const copy = renewalCopy(data.daysUntilExpiry)
  const tierLabel = TIER_LABELS_RENEW[data.tier] || data.tier
  const expiryStr = data.expiresAt.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  try {
    await resend.emails.send({
      from: FROM,
      to: [data.to],
      subject: copy.subject(data.businessName),
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">${copy.heading}</h2>
        <p>${copy.urgency}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#FAFAFA;border-radius:12px;overflow:hidden">
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Business</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.businessName}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Package</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${tierLabel}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Renewal Amount</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${data.amount}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:40%;vertical-align:top">Expires</td><td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${expiryStr}</td></tr>
        </table>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.renewUrl, copy.cta)}
        </div>
        <p style="font-size:13px;color:#6B7280">Clicking the button above will take you to Yoco's secure checkout to complete payment for another year.</p>
      `),
    })
    console.log(`[email] Renewal reminder (${data.daysUntilExpiry}d) sent to:`, data.to)
    return true
  } catch (e) {
    console.error('[email] Failed to send renewal reminder:', e)
    return false
  }
}

export interface EnquiryConfirmationData {
  to: string
  contactPerson: string
  businessName?: string
  siteUrl: string
}

export async function sendEnquiryConfirmation(data: EnquiryConfirmationData): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log('[email] Enquiry confirmation skipped (not configured):', data.to)
    return false
  }

  const firstName = data.contactPerson.split(' ')[0] || 'there'

  try {
    await resend.emails.send({
      from: FROM,
      to: [data.to],
      subject: `We've received your message — Doing Business in Bushbuckridge`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">Thank you, ${firstName}!</h2>
        <p>We've received your enquiry${data.businessName ? ' regarding ' + data.businessName : ''} and a member of our team will respond within 1–2 business days.</p>
        <p>In the meantime, feel free to explore the directory to discover more local businesses, jobs, and events in Bushbuckridge.</p>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.siteUrl, 'Visit the Directory')}
        </div>
      `),
    })
    console.log('[email] Enquiry confirmation sent to:', data.to)
    return true
  } catch (e) {
    console.error('[email] Failed to send enquiry confirmation:', e)
    return false
  }
}

export interface SpotlightReminderData {
  quarter: string
  year: number
  businesses: Array<{
    name: string
    articlesThisQuarter: number
    status: string
  }>
  adminUrl: string
}

export async function sendSpotlightReminderEmail(data: SpotlightReminderData): Promise<boolean> {
  const resend = getResend()
  if (!resend || !ADMIN_EMAIL) {
    console.log('[email] Spotlight reminder skipped (not configured)')
    return false
  }

  const rows = data.businesses.map(b => `
    <tr>
      <td style="padding:12px 16px;color:#1B4332;font-weight:600;vertical-align:top">${b.name}</td>
      <td style="padding:12px 16px;vertical-align:top">
        <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;background:${b.articlesThisQuarter > 0 ? '#DCFCE7' : '#FEE2E2'};color:${b.articlesThisQuarter > 0 ? '#166534' : '#991B1B'}">
          ${b.articlesThisQuarter > 0 ? `${b.articlesThisQuarter} article${b.articlesThisQuarter > 1 ? 's' : ''} written` : 'No article yet'}
        </span>
      </td>
      <td style="padding:12px 16px;color:#6B7280;font-size:13px;vertical-align:top;text-transform:capitalize">${b.status}</td>
    </tr>
  `).join('')

  const missing = data.businesses.filter(b => b.articlesThisQuarter === 0).length

  try {
    await resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: `Spotlight Articles — ${data.quarter} ${data.year} status (${missing} pending)`,
      html: wrap(`
        <h2 style="color:#1B4332;margin-top:0">Spotlight Articles — ${data.quarter} ${data.year}</h2>
        <p>Monthly reminder: <strong>${missing} of ${data.businesses.length}</strong> Pro Business listing${missing !== 1 ? 's' : ''} still need${missing === 1 ? 's' : ''} a spotlight article this quarter.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;border-radius:12px;overflow:hidden">
          <thead>
            <tr style="background:#1B4332">
              <th style="padding:12px 16px;text-align:left;color:#FFD700;font-size:12px;letter-spacing:1px;text-transform:uppercase">Business</th>
              <th style="padding:12px 16px;text-align:left;color:#FFD700;font-size:12px;letter-spacing:1px;text-transform:uppercase">Articles</th>
              <th style="padding:12px 16px;text-align:left;color:#FFD700;font-size:12px;letter-spacing:1px;text-transform:uppercase">Status</th>
            </tr>
          </thead>
          <tbody style="background:#FAFAFA">
            ${rows}
          </tbody>
        </table>
        <div style="text-align:center;margin:32px 0">
          ${ctaButton(data.adminUrl, 'Manage Spotlight Articles')}
        </div>
      `),
    })
    console.log('[email] Spotlight reminder sent:', data.businesses.length, 'businesses')
    return true
  } catch (e) {
    console.error('[email] Failed to send spotlight reminder:', e)
    return false
  }
}
