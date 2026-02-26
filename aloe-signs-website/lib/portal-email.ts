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

export async function notifyAdminNewJob(opts: { clientName: string; clientEmail: string; fileCount: number }) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';
  await sendPortalEmail({ to, subject: `New Print Job - ${opts.clientName}`, title: 'New Job', body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">New Print Job Submitted</h1><p style="color:#6b7280">Client: <strong>${opts.clientName}</strong> (${opts.clientEmail})</p><p style="color:#6b7280">Files: <strong>${opts.fileCount}</strong></p><div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View in Admin Portal</a></div>`, text: `New print job from ${opts.clientName} (${opts.clientEmail}). ${opts.fileCount} file(s).` });
}

export async function notifyClientProofReady(opts: { clientEmail: string; clientName: string; proofName: string }) {
  await sendPortalEmail({ to: opts.clientEmail, subject: `Proof Ready for Review`, title: 'Proof Ready', body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">Your Proof is Ready!</h1><p style="color:#6b7280">Hi ${opts.clientName}, a proof is ready for your review:</p><div style="background:#f0fce4;border-left:4px solid #84cc16;border-radius:6px;padding:18px 20px;margin:20px 0"><p style="margin:0;font-size:16px;font-weight:700;color:#2d2d2d">${opts.proofName}</p></div><div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">Review Proof</a></div>`, text: `Hi ${opts.clientName}, your proof "${opts.proofName}" is ready for review.` });
}

export async function notifyAdminProofResponse(opts: { clientName: string; clientEmail: string; proofName: string; action: string; comment?: string }) {
  const to = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';
  const emoji = opts.action === 'Approved' ? '✅' : '✏️';
  await sendPortalEmail({ to, subject: `${emoji} Proof ${opts.action} - ${opts.proofName}`, title: `Proof ${opts.action}`, body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d">${emoji} Proof ${opts.action}</h1><p style="color:#6b7280">Client: <strong>${opts.clientName}</strong></p><p style="color:#6b7280">Proof: <strong>${opts.proofName}</strong></p>${opts.comment ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;font-size:14px;color:#374151"><strong>Comment:</strong> ${opts.comment}</p></div>` : ''}<div style="text-align:center;margin-top:28px"><a href="https://aloe-signs-website.vercel.app/portal/admin" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px">View in Admin</a></div>`, text: `Proof "${opts.proofName}" was ${opts.action} by ${opts.clientName}.${opts.comment ? ` Comment: ${opts.comment}` : ''}` });
}
