import nodemailer from 'nodemailer';
import {
  buildEmailHtml,
  buildButton,
  buildSectionHeading,
  buildInfoRow,
  buildDetailsTable,
  buildInfoBox,
  buildFallbackLink,
  buildDivider,
  brand,
} from './emailTemplate';

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

// ─── Generic Portal Email Sender ──────────────────────────────────────────────

export async function sendPortalEmail(opts: {
  to: string;
  subject: string;
  title: string;
  body: string;
  text: string;
  preview?: string;
}) {
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `"Aloe Signs" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: buildEmailHtml(opts.title, opts.body, opts.preview),
  });
}

// ─── Email Verification ───────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, link: string, fullName: string) {
  const firstName = fullName.split(' ')[0];

  const body = `
    <!-- Icon Badge -->
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
      ${buildButton('Verify My Email Address', link)}
    </div>

    <!-- Fallback Link -->
    ${buildFallbackLink(link)}

    ${buildDivider()}

    <!-- What's Next -->
    ${buildSectionHeading('What happens next?')}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:24px;">
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
    ${buildInfoBox("This link expires in <strong>24 hours</strong>. If you didn't create an Aloe Signs account, you can safely ignore this email — no action is required.", 'info')}
  `;

  await sendPortalEmail({
    to: email,
    subject: 'Action Required: Verify your Aloe Signs account',
    title: 'Verify your Aloe Signs account',
    preview: `Hi ${firstName}, please verify your email to activate your Aloe Signs account.`,
    body,
    text: `Hi ${firstName}, welcome to Aloe Signs! Please verify your email by visiting this link: ${link}`,
  });
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

interface Allowance { date: string; startTime: string; endTime: string; }

interface NotifyAdminOptions {
  clientName: string;
  clientEmail: string;
  company?: string;
  contactNumber?: string;
  material?: string;
  deliveryType?: string;
  deliveryAddress?: string;
  groundClearance?: string;
  waterElectricityNotes?: string;
  safetyFileRequired?: boolean;
  siteContactPerson?: string;
  siteContactNumber?: string;
  accessContactPerson?: string;
  accessContactNumber?: string;
  completionTarget?: string;
  setupAllowance?: Allowance[];
  strikeAllowance?: Allowance[];
  storageRequired?: boolean;
  storageTimeEstimate?: string;
  files: Array<{ displayName?: string; originalName: string; description?: string }>;
}

// ─── Admin: New Job Submission ─────────────────────────────────────────────────

export async function notifyAdminNewJob(opts: NotifyAdminOptions) {
  const adminTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const formatAllowance = (allowances?: Allowance[]) => {
    if (!allowances || allowances.length === 0) return 'None';
    return allowances.map(a => `${a.date} (${a.startTime} – ${a.endTime})`).join('<br>');
  };

  const fileCards = opts.files.map((f, i) => {
    const name = f.displayName || f.originalName;
    const subtitle = f.displayName && f.originalName !== f.displayName
      ? `<p style="margin:2px 0 0;font-size:12px;color:${brand.textMuted};word-break:break-all;">${f.originalName}</p>`
      : '';
    return `
      <div style="background:${brand.offWhite};border:1px solid ${brand.border};border-radius:8px;padding:14px 16px;margin-bottom:8px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:${brand.textDark};">📎 File ${i + 1}: ${name}</p>
        ${subtitle}
        ${f.description ? `<p style="margin:6px 0 0;font-size:13px;color:${brand.textMid};">${f.description}</p>` : ''}
      </div>`;
  }).join('');

  const clientRows = [
    opts.company && buildInfoRow('Company', opts.company),
    buildInfoRow('Client Name', opts.clientName),
    opts.contactNumber && buildInfoRow('Contact No.', opts.contactNumber),
    buildInfoRow('Email', `<a href="mailto:${opts.clientEmail}" style="color:${brand.green};text-decoration:none;">${opts.clientEmail}</a>`),
  ].filter(Boolean).join('');

  const jobRows = [
    opts.material && buildInfoRow('Material', opts.material),
    opts.deliveryType && buildInfoRow('Fulfillment', opts.deliveryType),
    opts.deliveryAddress && buildInfoRow('Address', opts.deliveryAddress),
    opts.groundClearance && buildInfoRow('Ground Clearance', opts.groundClearance),
    opts.safetyFileRequired !== undefined && buildInfoRow('Safety File Req?', opts.safetyFileRequired ? '✅ Yes' : '❌ No'),
    opts.waterElectricityNotes && buildInfoRow('Water/Electric Notes', opts.waterElectricityNotes),
    opts.siteContactPerson && buildInfoRow('Site Contact', `${opts.siteContactPerson} ${opts.siteContactNumber ? `(${opts.siteContactNumber})` : ''}`),
    opts.accessContactPerson && buildInfoRow('Access Contact', `${opts.accessContactPerson} ${opts.accessContactNumber ? `(${opts.accessContactNumber})` : ''}`),
    opts.completionTarget && buildInfoRow('Target Date', opts.completionTarget),
    opts.storageRequired && buildInfoRow('Storage Req?', `✅ Yes${opts.storageTimeEstimate ? ` — ${opts.storageTimeEstimate}` : ''}`),
  ].filter(Boolean).join('');

  const allowanceRows = [
    buildInfoRow('Setup Allowance', formatAllowance(opts.setupAllowance)),
    buildInfoRow('Strike Allowance', formatAllowance(opts.strikeAllowance)),
  ].join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${brand.textDark};">📋 New Job Submission</h1>
    <p style="margin:0 0 32px;font-size:15px;color:${brand.textMuted};">A new job has been submitted via the Aloe Signs Client Portal.</p>

    ${buildSectionHeading('Client Profile')}
    ${buildDetailsTable(clientRows)}

    ${buildSectionHeading('Job Specifications')}
    ${buildDetailsTable(jobRows || buildInfoRow('Details', 'No job specifications provided.'))}

    ${buildSectionHeading('Site Allowances')}
    ${buildDetailsTable(allowanceRows)}

    ${buildSectionHeading(`Uploaded Files (${opts.files.length})`)}
    ${fileCards || `<p style="font-size:14px;color:${brand.textMuted};">No files uploaded.</p>`}

    <div style="text-align:center;margin-top:32px;">
      ${buildButton('Open Admin Portal', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}/portal/admin`)}
    </div>
  `;

  await adminTransporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to: process.env.UPLOAD_NOTIFICATION_EMAIL,
    subject: `New Job: ${opts.clientName}${opts.company ? ` (${opts.company})` : ''}`,
    text: `New job submission received from ${opts.clientName}. View details in the admin portal.`,
    html: buildEmailHtml('New Job Submission', body, `New job from ${opts.clientName}`),
  });
}

// ─── Client: Proof Ready ──────────────────────────────────────────────────────

export async function notifyClientProofReady(opts: { clientEmail: string; clientName: string; proofName: string }) {
  const firstName = opts.clientName.split(' ')[0];

  const body = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">🎨</div>
    </div>

    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">Your proof is ready!</h1>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
      Hi <strong style="color:${brand.textDark};">${firstName}</strong> — your design proof is ready for review. Please log in to the Client Portal to approve or request changes.
    </p>

    ${buildSectionHeading('Proof Details')}
    ${buildDetailsTable(buildInfoRow('Proof Name', opts.proofName))}

    <div style="text-align:center;margin-top:32px;">
      ${buildButton('Review My Proof', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}/portal/`)}
    </div>

    ${buildInfoBox('Please review and respond to your proof as soon as possible so we can proceed with production.', 'info')}
  `;

  await sendPortalEmail({
    to: opts.clientEmail,
    subject: `Proof Ready for Review — ${opts.proofName}`,
    title: 'Proof Ready for Review',
    preview: `Hi ${firstName}, your design proof is ready for review.`,
    body,
    text: `Hi ${firstName}, your proof "${opts.proofName}" is ready for review. Log in here: ${process.env.NEXT_PUBLIC_SITE_URL}/portal/`,
  });
}

// ─── Admin: Proof Response ────────────────────────────────────────────────────

export async function notifyAdminProofResponse(opts: {
  clientName: string;
  clientEmail: string;
  proofName: string;
  action: string;
  comment?: string;
}) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';
  const isApproved = opts.action === 'Approved';
  const emoji = isApproved ? '✅' : '✏️';
  const statusType = isApproved ? 'success' : 'warning';

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${brand.textDark};">${emoji} Proof ${opts.action}</h1>
    <p style="margin:0 0 32px;font-size:15px;color:${brand.textMuted};">A client has responded to a proof.</p>

    ${buildSectionHeading('Details')}
    ${buildDetailsTable([
    buildInfoRow('Client', opts.clientName),
    buildInfoRow('Email', `<a href="mailto:${opts.clientEmail}" style="color:${brand.green};text-decoration:none;">${opts.clientEmail}</a>`),
    buildInfoRow('Proof', opts.proofName),
    buildInfoRow('Action', `<strong style="color:${isApproved ? brand.greenDark : '#b45309'};">${opts.action}</strong>`),
  ].join(''))}

    ${opts.comment ? `
      ${buildSectionHeading('Client Comment')}
      <div style="background:${brand.offWhite};border:1px solid ${brand.border};border-radius:8px;padding:16px 20px;margin-bottom:8px;">
        <p style="margin:0;font-size:14px;color:${brand.textDark};line-height:1.6;font-style:italic;">"${opts.comment}"</p>
      </div>
    ` : ''}

    <div style="text-align:center;margin-top:32px;">
      ${buildButton('View in Admin Portal', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}/portal/admin`)}
    </div>
  `;

  await sendPortalEmail({
    to,
    subject: `${emoji} Proof ${opts.action} — ${opts.proofName}`,
    title: `Proof ${opts.action}`,
    preview: `${opts.clientName} has ${opts.action.toLowerCase()} the proof: ${opts.proofName}`,
    body,
    text: `Proof "${opts.proofName}" was ${opts.action} by ${opts.clientName}.${opts.comment ? ` Comment: ${opts.comment}` : ''}`,
  });
}

// ─── Admin: Artwork Upload ────────────────────────────────────────────────────

export async function notifyAdminArtworkUpload(opts: {
  clientName: string;
  clientEmail: string;
  contactNumber?: string;
  files: Array<{ displayName: string; description: string }>;
}) {
  const adminTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const clientRows = [
    buildInfoRow('Name', opts.clientName),
    opts.contactNumber ? buildInfoRow('Number', opts.contactNumber) : '',
    buildInfoRow('Email', `<a href="mailto:${opts.clientEmail}" style="color:${brand.green};text-decoration:none;">${opts.clientEmail}</a>`),
  ].filter(Boolean).join('');

  const artworkCards = opts.files.map((f, i) => `
    <div style="background:${brand.offWhite};border:1px solid ${brand.border};border-radius:8px;padding:14px 16px;margin-bottom:8px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:${brand.textDark};">🖼️ Artwork ${i + 1}: ${f.displayName}</p>
      ${f.description ? `<p style="margin:6px 0 0;font-size:13px;color:${brand.textMid};">${f.description}</p>` : ''}
    </div>
  `).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${brand.textDark};">🖼️ New Artwork Uploaded</h1>
    <p style="margin:0 0 32px;font-size:15px;color:${brand.textMuted};">A client has uploaded artwork via the Aloe Signs Client Portal.</p>

    ${buildSectionHeading('Client Details')}
    ${buildDetailsTable(clientRows)}

    ${buildSectionHeading(`Artwork Files (${opts.files.length})`)}
    ${artworkCards}

    <div style="text-align:center;margin-top:32px;">
      ${buildButton('View in Admin Portal', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}/portal/admin`)}
    </div>
  `;

  await adminTransporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to: 'team@aloesigns.co.za',
    subject: `New Artwork Uploaded: ${opts.clientName}`,
    text: `New artwork uploaded by ${opts.clientName}. Details: ${opts.files.map(f => f.displayName).join(', ')}.`,
    html: buildEmailHtml('New Artwork Uploaded', body, `New artwork from ${opts.clientName}`),
  });
}
