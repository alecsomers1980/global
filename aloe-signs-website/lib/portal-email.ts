import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Brand Header -->
    <div style="background-color:#2d2d2d;padding:40px 20px;border-radius:16px 16px 0 0;text-align:center;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
      <img src="https://aloe-signs-website.vercel.app/aloe-logo.png" alt="Aloe Signs" width="180" style="display:block;margin:0 auto;" />
    </div>
    
    <!-- Content Body -->
    <div style="background-color:#ffffff;padding:48px 40px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
      ${body}
      
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f1f5f9;text-align:center;">
        <p style="margin:0;font-size:14px;color:#94a3b8;font-weight:500;">Aloe Signs Client Portal</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;">
      <p style="margin:0;font-size:12px;color:#cbd5e1;">&copy; ${new Date().getFullYear()} Aloe Signs. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendPortalEmail(opts: { to: string; subject: string; title: string; body: string; text: string }) {
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `"Aloe Signs" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: wrapHtml(opts.title, opts.body)
  });
}

export async function sendVerificationEmail(email: string, link: string, fullName: string) {
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:700;color:#1e293b;text-align:center;">Welcome to Aloe Signs!</h1>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#475569;text-align:center;">Hi ${fullName}, thank you for registering with the Aloe Signs Client Portal. Please confirm your email address to activate your account.</p>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="display:inline-block;background-color:#84cc16;color:#1a1a1a;font-weight:700;padding:16px 40px;text-decoration:none;border-radius:12px;font-size:16px;box-shadow:0 4px 6px -1px rgba(132, 204, 22, 0.2);">Confirm Email Address</a>
    </div>
    
    <p style="margin:32px 0 0 0;font-size:14px;line-height:1.6;color:#94a3b8;text-align:center;">If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#84cc16;text-align:center;word-break:break-all;">${link}</p>
    
    <p style="margin:40px 0 0 0;font-size:14px;color:#64748b;text-align:center;">If you didn't create an account, you can safely ignore this email.</p>
  `;

  await sendPortalEmail({
    to: email,
    subject: 'Confirm your Aloe Signs account',
    title: 'Confirm your account',
    body,
    text: `Hi ${fullName}, welcome to Aloe Signs! Please confirm your email by visiting this link: ${link}`
  });
}

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

export async function notifyAdminNewJob(opts: NotifyAdminOptions) {
  const adminTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const tdStyle = 'padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#4b5563';

  // Client Details
  const clientRows = [
    opts.company && `<tr><td style="${tdStyle};font-weight:600;width:120px">Company</td><td style="${tdStyle}">${opts.company}</td></tr>`,
    `<tr><td style="${tdStyle};font-weight:600;width:120px">Client Name</td><td style="${tdStyle}">${opts.clientName}</td></tr>`,
    opts.contactNumber && `<tr><td style="${tdStyle};font-weight:600;width:120px">Contact No</td><td style="${tdStyle}">${opts.contactNumber}</td></tr>`,
    `<tr><td style="${tdStyle};font-weight:600;width:120px">Email</td><td style="${tdStyle}">${opts.clientEmail}</td></tr>`,
  ].filter(Boolean).join('');

  // Job Details
  const jobRows = [
    opts.material && `<tr><td style="${tdStyle};font-weight:600;width:150px">Material</td><td style="${tdStyle}">${opts.material}</td></tr>`,
    opts.deliveryType && `<tr><td style="${tdStyle};font-weight:600;width:150px">Fulfillment</td><td style="${tdStyle}">${opts.deliveryType}</td></tr>`,
    opts.deliveryAddress && `<tr><td style="${tdStyle};font-weight:600;width:150px">Address</td><td style="${tdStyle}">${opts.deliveryAddress}</td></tr>`,
    opts.groundClearance && `<tr><td style="${tdStyle};font-weight:600;width:150px">Ground Clearance</td><td style="${tdStyle}">${opts.groundClearance}</td></tr>`,
    opts.safetyFileRequired !== undefined && `<tr><td style="${tdStyle};font-weight:600;width:150px">Safety File Req?</td><td style="${tdStyle}">${opts.safetyFileRequired ? 'YES' : 'NO'}</td></tr>`,
    opts.waterElectricityNotes && `<tr><td style="${tdStyle};font-weight:600;width:150px">Water/Electric Notes</td><td style="${tdStyle}">${opts.waterElectricityNotes}</td></tr>`,
    opts.siteContactPerson && `<tr><td style="${tdStyle};font-weight:600;width:150px">Site Contact</td><td style="${tdStyle}">${opts.siteContactPerson} (${opts.siteContactNumber})</td></tr>`,
    opts.accessContactPerson && `<tr><td style="${tdStyle};font-weight:600;width:150px">Access Contact</td><td style="${tdStyle}">${opts.accessContactPerson} (${opts.accessContactNumber})</td></tr>`,
    opts.completionTarget && `<tr><td style="${tdStyle};font-weight:600;width:150px">Target Date</td><td style="${tdStyle}">${opts.completionTarget}</td></tr>`,
    opts.storageRequired && `<tr><td style="${tdStyle};font-weight:600;width:150px">Storage Req?</td><td style="${tdStyle}">YES (${opts.storageTimeEstimate})</td></tr>`,
  ].filter(Boolean).join('');

  // Allowance formatting
  const formatAllowance = (allowances?: Allowance[]) => {
    if (!allowances || allowances.length === 0) return 'None';
    return allowances.map(a => `${a.date} (${a.startTime} - ${a.endTime})`).join('<br/>');
  };

  const allowanceRows = [
    `<tr><td style="${tdStyle};font-weight:600;width:150px">Setup Allowance</td><td style="${tdStyle}">${formatAllowance(opts.setupAllowance)}</td></tr>`,
    `<tr><td style="${tdStyle};font-weight:600;width:150px">Strike Allowance</td><td style="${tdStyle}">${formatAllowance(opts.strikeAllowance)}</td></tr>`,
  ].join('');

  // File cards
  const fileCards = opts.files.map((f, i) => {
    const name = f.displayName || f.originalName;
    const subtitle = f.displayName && f.originalName !== f.displayName ? `<p style="margin:2px 0 0 0;font-size:12px;color:#9ca3af;word-break:break-all">${f.originalName}</p>` : '';
    return `<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:8px;border:1px solid #e5e7eb">
      <p style="margin:0;font-size:14px;font-weight:700;color:#2d2d2d;word-break:break-word">File ${i + 1}: ${name}</p>
      ${subtitle}
      ${f.description ? `<p style="margin:6px 0 0 0;font-size:13px;color:#6b7280">${f.description}</p>` : ''}
    </div>`;
  }).join('');

  const body = `
    <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#2d2d2d">New Job Submission</h1>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Client Profile</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${clientRows}</table>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Job Specifications</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${jobRows}</table>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Allowances</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${allowanceRows}</table>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Uploaded Files (${opts.files.length})</h3>
    ${fileCards}

    <div style="text-align:center;margin-top:28px">
      <a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">Open Admin Portal</a>
    </div>`;

  await adminTransporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to: process.env.UPLOAD_NOTIFICATION_EMAIL,
    subject: `New Job: ${opts.clientName}${opts.company ? ` (${opts.company})` : ''}`,
    text: `New job submission received from ${opts.clientName}. View details in the admin portal.`,
    html: wrapHtml('New Job Submission', body),
  });
}

export async function notifyClientProofReady(opts: { clientEmail: string; clientName: string; proofName: string }) {
  await sendPortalEmail({ to: opts.clientEmail, subject: `Proof Ready for Review`, title: 'Proof Ready', body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">Your Proof is Ready!</h1><p style="color:#6b7280">Hi ${opts.clientName}, a proof is ready for your review:</p><div style="background:#f0fce4;border-left:4px solid #84cc16;border-radius:6px;padding:18px 20px;margin:20px 0"><p style="margin:0;font-size:16px;font-weight:700;color:#2d2d2d">${opts.proofName}</p></div><div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">Review Proof</a></div>`, text: `Hi ${opts.clientName}, your proof "${opts.proofName}" is ready for review.` });
}

export async function notifyAdminProofResponse(opts: { clientName: string; clientEmail: string; proofName: string; action: string; comment?: string }) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';
  const emoji = opts.action === 'Approved' ? '✅' : '✏️';
  await sendPortalEmail({ to, subject: `${emoji} Proof ${opts.action} - ${opts.proofName}`, title: `Proof ${opts.action}`, body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">${emoji} Proof ${opts.action}</h1><p style="color:#6b7280">Client: <strong>${opts.clientName}</strong></p><p style="color:#6b7280">Proof: <strong>${opts.proofName}</strong></p>${opts.comment ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;font-size:14px;color:#374151"><strong>Comment:</strong> ${opts.comment}</p></div>` : ''}<div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View in Admin</a></div>`, text: `Proof "${opts.proofName}" was ${opts.action} by ${opts.clientName}.${opts.comment ? ` Comment: ${opts.comment}` : ''}` });
}
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

  const tdStyle = 'padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#4b5563';

  const clientRows = [
    `<tr><td style="${tdStyle};font-weight:600;width:120px">From Name</td><td style="${tdStyle}">${opts.clientName}</td></tr>`,
    opts.contactNumber && `<tr><td style="${tdStyle};font-weight:600;width:120px">Number</td><td style="${tdStyle}">${opts.contactNumber}</td></tr>`,
    `<tr><td style="${tdStyle};font-weight:600;width:120px">Email</td><td style="${tdStyle}">${opts.clientEmail}</td></tr>`,
  ].filter(Boolean).join('');

  const artworkCards = opts.files.map((f, i) => `
    <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:8px;border:1px solid #e5e7eb">
      <p style="margin:0;font-size:14px;font-weight:700;color:#2d2d2d">Artwork Name: ${f.displayName}</p>
      ${f.description ? `<p style="margin:6px 0 0 0;font-size:13px;color:#6b7280">${f.description}</p>` : ''}
    </div>
  `).join('');

  const body = `
    <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#2d2d2d">New Artwork Uploaded</h1>
    
    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Client Details</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${clientRows}</table>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Artwork Details</h3>
    ${artworkCards}

    <div style="text-align:center;margin-top:28px">
      <a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View in Admin Portal</a>
    </div>`;

  await adminTransporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to: 'team@aloesigns.co.za',
    subject: `New Artwork Uploaded: ${opts.clientName}`,
    text: `New artwork uploaded by ${opts.clientName}. Details: ${opts.files.map(f => f.displayName).join(', ')}. View in admin: https://aloe-signs-website.vercel.app/portal/admin`,
    html: wrapHtml('New Artwork Uploaded', body),
  });
}
