import { Resend } from 'resend'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = process.env.EMAIL_FROM || 'Bushbuckridge Directory <noreply@dbib.co.za>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || ''

function brandHeader(): string {
  return `
    <div style="background:#1B4332;padding:32px;text-align:center;border-radius:16px 16px 0 0">
      <h1 style="color:#FFD700;font-family:Arial,sans-serif;margin:0;font-size:24px">Bushbuckridge Community Directory</h1>
    </div>
  `
}

function brandFooter(): string {
  return `
    <div style="padding:24px;text-align:center;color:#6B7280;font-size:12px;font-family:Arial,sans-serif">
      <p>Ember Automations — Clean, Functional, Local.</p>
      <p>This email was sent by the Bushbuckridge Community Directory system.</p>
    </div>
  `
}

function wrap(content: string): string {
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
      ${brandHeader()}
      <div style="padding:32px;color:#2D3436;line-height:1.6">${content}</div>
      ${brandFooter()}
    </div>
  `
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
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;width:40%">Package</td><td style="padding:12px 16px">${tierLabel}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Amount Paid</td><td style="padding:12px 16px">${data.amount}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Reference</td><td style="padding:12px 16px">${data.paymentRef}</td></tr>
        </table>
        <p>Your listing is now active. Visit your portal to manage your business profile and track performance.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${data.portalUrl}" style="display:inline-block;background:#1B4332;color:#FFD700;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">Go to Your Portal</a>
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
          <a href="${data.portalUrl}" style="display:inline-block;background:#1B4332;color:#FFD700;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">Access Your Portal</a>
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
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;width:40%">Business</td><td style="padding:12px 16px">${data.businessName}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Contact</td><td style="padding:12px 16px">${data.contactName}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Email</td><td style="padding:12px 16px">${data.email}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Phone</td><td style="padding:12px 16px">${data.phone || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Package</td><td style="padding:12px 16px">${tierLabel}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Sector</td><td style="padding:12px 16px">${data.sector || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Area</td><td style="padding:12px 16px">${data.area || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin:32px 0">
          <a href="${data.adminUrl}" style="display:inline-block;background:#1B4332;color:#FFD700;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">View in Admin Panel</a>
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
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280;width:40%">Type</td><td style="padding:12px 16px">${data.type}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Contact Person</td><td style="padding:12px 16px">${data.contactPerson}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Business</td><td style="padding:12px 16px">${data.businessName || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Email</td><td style="padding:12px 16px">${data.email}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Phone</td><td style="padding:12px 16px">${data.phone || '—'}</td></tr>
          <tr><td style="padding:12px 16px;font-weight:bold;color:#6B7280">Details</td><td style="padding:12px 16px">${data.details || '—'}</td></tr>
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
