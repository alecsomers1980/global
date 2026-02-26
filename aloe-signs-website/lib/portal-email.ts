import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:40px 20px"><div style="background:#2d2d2d;padding:24px;border-radius:12px 12px 0 0;text-align:center"><img src="https://aloe-signs-website.vercel.app/aloe-logo.png" alt="Aloe Signs" width="160" style="display:block;margin:0 auto" /></div><div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">${body}</div><p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:24px">Aloe Signs Client Portal</p></div></body></html>`;
}

export async function sendPortalEmail(opts: { to: string; subject: string; title: string; body: string; text: string }) {
  await transporter.sendMail({ from: `"Aloe Signs" <${process.env.SMTP_USER}>`, to: opts.to, subject: opts.subject, text: opts.text, html: wrapHtml(opts.title, opts.body) });
}

interface JobFileInfo { displayName: string; originalName: string; description: string; width: number; height: number; unit: string; quantity: number; }

export async function notifyAdminNewJob(opts: { clientName: string; clientEmail: string; company?: string; contactNumber?: string; files: JobFileInfo[] }) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';

  const thStyle = 'text-align:left;padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb';
  const tdStyle = 'padding:8px 12px;font-size:14px;color:#2d2d2d;border-bottom:1px solid #f3f4f6';

  // Client info rows
  const clientRows = [
    opts.company ? `<tr><td style="${tdStyle};font-weight:600;width:120px">Company</td><td style="${tdStyle}">${opts.company}</td></tr>` : '',
    `<tr><td style="${tdStyle};font-weight:600;width:120px">Name</td><td style="${tdStyle}">${opts.clientName}</td></tr>`,
    opts.contactNumber ? `<tr><td style="${tdStyle};font-weight:600;width:120px">Contact</td><td style="${tdStyle}">${opts.contactNumber}</td></tr>` : '',
    `<tr><td style="${tdStyle};font-weight:600;width:120px">Email</td><td style="${tdStyle}">${opts.clientEmail}</td></tr>`,
  ].filter(Boolean).join('');

  // File rows
  const fileRows = opts.files.map((f, i) => {
    const name = f.displayName || f.originalName;
    const dims = (f.width || f.height) ? `${f.width} × ${f.height} ${f.unit}` : '—';
    return `<tr>
      <td style="${tdStyle}">${i + 1}</td>
      <td style="${tdStyle}"><strong>${name}</strong>${f.displayName && f.originalName !== f.displayName ? `<br/><span style="color:#9ca3af;font-size:12px">${f.originalName}</span>` : ''}</td>
      <td style="${tdStyle}">${f.description || '—'}</td>
      <td style="${tdStyle}">${dims}</td>
      <td style="${tdStyle}">${f.quantity}</td>
    </tr>`;
  }).join('');

  const body = `
    <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#2d2d2d">New Job</h1>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Client Details</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${clientRows}</table>

    <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#84cc16;text-transform:uppercase;letter-spacing:0.5px">Job Specifications</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr><th style="${thStyle}">#</th><th style="${thStyle}">File</th><th style="${thStyle}">Description</th><th style="${thStyle}">Size</th><th style="${thStyle}">Qty</th></tr>
      ${fileRows}
    </table>

    <div style="text-align:center;margin-top:28px">
      <a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View Files in Admin Portal</a>
    </div>`;

  const fileList = opts.files.map((f, i) => `${i + 1}. ${f.displayName || f.originalName}${f.description ? ` - ${f.description}` : ''}`).join('\n');
  const text = `New Job from ${opts.clientName} (${opts.clientEmail}).\n${opts.company ? `Company: ${opts.company}\n` : ''}${opts.contactNumber ? `Contact: ${opts.contactNumber}\n` : ''}\nFiles:\n${fileList}`;

  await sendPortalEmail({ to, subject: `New Job – ${opts.clientName}`, title: 'New Job', body, text });
}

export async function notifyClientProofReady(opts: { clientEmail: string; clientName: string; proofName: string }) {
  await sendPortalEmail({ to: opts.clientEmail, subject: `Proof Ready for Review`, title: 'Proof Ready', body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">Your Proof is Ready!</h1><p style="color:#6b7280">Hi ${opts.clientName}, a proof is ready for your review:</p><div style="background:#f0fce4;border-left:4px solid #84cc16;border-radius:6px;padding:18px 20px;margin:20px 0"><p style="margin:0;font-size:16px;font-weight:700;color:#2d2d2d">${opts.proofName}</p></div><div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">Review Proof</a></div>`, text: `Hi ${opts.clientName}, your proof "${opts.proofName}" is ready for review.` });
}

export async function notifyAdminProofResponse(opts: { clientName: string; clientEmail: string; proofName: string; action: string; comment?: string }) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';
  const emoji = opts.action === 'Approved' ? '✅' : '✏️';
  await sendPortalEmail({ to, subject: `${emoji} Proof ${opts.action} - ${opts.proofName}`, title: `Proof ${opts.action}`, body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">${emoji} Proof ${opts.action}</h1><p style="color:#6b7280">Client: <strong>${opts.clientName}</strong></p><p style="color:#6b7280">Proof: <strong>${opts.proofName}</strong></p>${opts.comment ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;font-size:14px;color:#374151"><strong>Comment:</strong> ${opts.comment}</p></div>` : ''}<div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View in Admin</a></div>`, text: `Proof "${opts.proofName}" was ${opts.action} by ${opts.clientName}.${opts.comment ? ` Comment: ${opts.comment}` : ''}` });
}
