import nodemailer from 'nodemailer';
import {
  buildEmailHtml,
  buildButton,
  buildSectionHeading,
  brand,
} from '@/lib/emailTemplate';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za';

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Email credentials not configured.');
    return null;
  }

  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

export async function sendNewsReviewEmail(opts: {
  titles: string[];
  reviewUrl?: string;
}): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const reviewUrl = opts.reviewUrl || `${SITE_URL}/portal/admin/news`;

  // Build HTML body
  const listItems = opts.titles
    .map(
      (title) =>
        `<li style="color: ${brand.textDark}; font-size: 16px; margin-bottom: 8px;">${title}</li>`,
    )
    .join('');

  const bodyHtml = `
    <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
      Two new AI-drafted articles are ready for your review in the admin portal.
      They will only go live once approved.
    </p>
    ${buildSectionHeading('Articles Awaiting Review')}
    <ul style="padding-left: 24px; margin: 16px 0 24px;">
      ${listItems}
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      ${buildButton('Review & Approve', reviewUrl)}
    </div>
  `;

  const html = buildEmailHtml(
    'Blog Articles Awaiting Approval',
    bodyHtml,
    'Two new articles are ready for your review.',
  );

  // Plain text fallback
  const text = [
    'Two new AI-drafted articles are ready for review in the admin portal.',
    '',
    'Articles:',
    ...opts.titles.map((t) => `- ${t}`),
    '',
    `Review and approve them here: ${reviewUrl}`,
  ].join('\n');

  try {
    await transporter.sendMail({
      from: `"Aloe Signs Website" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: ['andre@aloesigns.co.za', 'team@aloesigns.co.za'],
      subject: '2 New Blog Articles Awaiting Approval — Aloe Signs',
      html,
      text,
    });
    console.log('News review email sent successfully.');
    return true;
  } catch (error) {
    console.error('Failed to send news review email:', error);
    return false;
  }
}