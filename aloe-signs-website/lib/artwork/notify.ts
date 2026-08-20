import nodemailer from 'nodemailer';
import { buildEmailHtml, buildButton, buildSectionHeading, buildInfoRow, buildDetailsTable, buildInfoBox, brand } from '@/lib/emailTemplate';
import type { SubmissionRow } from '@/lib/artwork/repository';

export async function notifyTeamOfArtwork(s: SubmissionRow): Promise<void> {
  const recipient = (process.env.ARTWORK_NOTIFICATION_EMAIL || 'team@aloesigns.co.za').trim();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za').trim();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const deleteDate = new Date(s.delete_after).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const detailRows = [
    s.company_name ? buildInfoRow('Company', s.company_name) : '',
    buildInfoRow('Contact person', s.contact_person),
    buildInfoRow('Contact number', s.contact_number),
    buildInfoRow(
      'Email',
      s.email
        ? `<a href="mailto:${s.email}" style="color:${brand.green}">${s.email}</a>`
        : '<em>not supplied — reply by phone</em>'
    ),
    buildInfoRow('Reference', s.reference),
  ]
    .filter(Boolean)
    .join('');

  const detailsTable = buildDetailsTable(detailRows);

  const fileCards = s.files
    .map((file) => {
      const size = `${(Number(file.size_bytes) / 1024 / 1024).toFixed(1)} MB`;
      return `<div style="background-color:${brand.offWhite}; border:1px solid ${brand.border}; border-radius:8px; padding:16px; margin-bottom:8px;">
        <div style="font-weight:600; color:${brand.textDark};">${file.original_name}</div>
        <div style="color:${brand.textMid};">${size}</div>
      </div>`;
    })
    .join('');

  const descriptionBlock = s.description
    ? `${buildSectionHeading('Description')}<div style="background-color:${brand.offWhite}; border:1px solid ${brand.border}; border-radius:8px; padding:16px; color:${brand.textDark}; white-space:pre-wrap;">${s.description}</div>`
    : '';

  const body = `
    <h1>New Artwork Upload</h1>
    <p>This artwork submission came from the public upload page at <a href="${siteUrl}/artwork">aloesigns.co.za/artwork</a>.</p>
    ${buildSectionHeading('Client Details')}
    ${detailsTable}
    ${descriptionBlock}
    ${buildSectionHeading(`Files (${s.files.length})`)}
    ${fileCards}
    ${buildInfoBox(`The files are automatically deleted on ${deleteDate}, sooner if downloaded.`, 'warning')}
    <div style="text-align:center;">${buildButton('Open in Portal', `${siteUrl}/portal/admin/artwork-uploads`)}</div>
  `;

  const text = `New artwork upload received.

Reference: ${s.reference}
Contact person: ${s.contact_person}
Contact number: ${s.contact_number}
Files: ${s.files.map((file) => file.original_name).join(', ')}
Delete after: ${deleteDate}`;

  const subject = `New Artwork Upload: ${s.contact_person}${s.company_name ? ` (${s.company_name})` : ''} — ${s.reference}`;

  await transporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    text,
    html: buildEmailHtml('New Artwork Upload', body, `New artwork from ${s.contact_person}`),
  });
}

