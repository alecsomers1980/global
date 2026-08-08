import { Resend } from 'resend';
import type { QuotePayload } from './quote-schema';
import { SITE } from '@/data/site';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendQuoteNotification(data: QuotePayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.QUOTE_FROM_EMAIL;
  const toEmail = process.env.QUOTE_TO_EMAIL || 'info@knp-panorama.com';

  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable.');
  if (!fromEmail) throw new Error('Missing QUOTE_FROM_EMAIL environment variable.');

  const resend = new Resend(apiKey);

  const rows: Array<[string, string]> = [];

  // Always present
  rows.push(['Name', escapeHtml(data.name)]);
  rows.push(['Email', escapeHtml(data.email)]);
  rows.push(['Phone', escapeHtml(data.phone)]);

  if (data.experience) rows.push(['Experience', escapeHtml(data.experience)]);
  if (data.destination) rows.push(['Destination', escapeHtml(data.destination)]);
  if (data.comfort) rows.push(['Comfort level', escapeHtml(data.comfort)]);

  const dateParts: string[] = [];
  if (data.dateFrom) dateParts.push(data.dateFrom);
  if (data.dateTo) dateParts.push(data.dateTo);
  if (dateParts.length > 0) {
    rows.push(['Travel dates', escapeHtml(dateParts.join(' – '))]);
  }

  if (data.adults !== undefined) rows.push(['Adults', data.adults.toString()]);
  if (data.children !== undefined) rows.push(['Children', data.children.toString()]);
  if (data.message) rows.push(['Message', escapeHtml(data.message)]);
  if (data.sourcePage) rows.push(['Submitted from', escapeHtml(data.sourcePage)]);

  const tableHtml = rows
    .map(([label, value]) => `<tr><td style="padding:4px 8px;font-weight:bold;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 8px">${value}</td></tr>`)
    .join('');

  const html = `
    <h2>New Quote Request</h2>
    <table style="border-collapse:collapse">${tableHtml}</table>
  `;

  const subject = `New quote request — ${data.experience ?? 'General enquiry'}`;

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: data.email,
    subject,
    html,
  });
}

export async function sendQuoteAutoReply(data: QuotePayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable.');
  if (!fromEmail) throw new Error('Missing QUOTE_FROM_EMAIL environment variable.');

  const resend = new Resend(apiKey);

  const experienceLine = data.experience
    ? `Thank you for your interest in our <strong>${escapeHtml(data.experience)}</strong> experience.`
    : 'Thank you for reaching out to us.';

  const html = `
    <p>Dear ${escapeHtml(data.name)},</p>
    <p>${experienceLine}</p>
    <p>We have received your request and one of our team members will reply within one business day with all the details you need.</p>
    <p>
      In the meantime, you can reach us on
      <strong>${escapeHtml(SITE.phone)}</strong>
      or
      <a href="${escapeHtml(SITE.whatsappHref)}">WhatsApp us</a>
      or email
      <a href="mailto:${escapeHtml(SITE.email)}">${escapeHtml(SITE.email)}</a>.
    </p>
    <p>Warm regards,<br/>The Kruger Panorama Experience team</p>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: data.email,
    subject: 'We have your request — Kruger Panorama Experience',
    html,
  });
}
