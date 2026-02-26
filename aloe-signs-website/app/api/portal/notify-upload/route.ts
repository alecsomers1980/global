import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface UploadNotification {
    clientEmail: string;
    clientName: string;
    projectName: string;
    quantity: string;
    size: string;
    comments: string;
    deliveryDate: string;
    fileNames: string[];
}

// Shared Aloe Signs colours
const LIME = '#84cc16';
const CHARCOAL = '#2d2d2d';
const GREY = '#6b7280';
const BG = '#f3f4f6';

function buildEmailHTML(d: UploadNotification): string {
    const fileRows = d.fileNames
        .map(
            name => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; font-size:14px;">
          📄 ${name}
        </td>
      </tr>`
        )
        .join('');

    const formattedDate = d.deliveryDate
        ? new Date(d.deliveryDate).toLocaleDateString('en-ZA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        : d.deliveryDate;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Client Upload</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1f2937;">
  <div style="padding:30px 20px;">

    <!-- Card -->
    <div style="max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:${CHARCOAL};padding:32px 36px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:26px;font-weight:900;color:${LIME};letter-spacing:3px;line-height:1;">ALOE SIGNS</div>
          <div style="color:#9ca3af;font-size:13px;margin-top:4px;">Client Upload Portal</div>
        </div>
        <div style="background:${LIME};color:${CHARCOAL};font-weight:700;font-size:12px;padding:6px 14px;border-radius:99px;letter-spacing:0.5px;">
          NEW JOB
        </div>
      </div>

      <!-- Body -->
      <div style="padding:36px;">
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:${CHARCOAL};">New File Upload Received</h1>
        <p style="margin:0 0 28px 0;color:${GREY};font-size:15px;">
          A client has submitted artwork files via the portal. Please review the job details below.
        </p>

        <!-- Alert Banner -->
        <div style="background:#f0fce4;border-left:4px solid ${LIME};border-radius:6px;padding:18px 20px;margin-bottom:28px;">
          <p style="margin:0;font-size:15px;font-weight:600;color:${CHARCOAL};">
            📬 From: <a href="mailto:${d.clientEmail}" style="color:${LIME};text-decoration:none;">${d.clientEmail}</a>
          </p>
          <p style="margin:6px 0 0 0;font-size:14px;color:${GREY};">${d.clientName}</p>
        </div>

        <!-- Job Details -->
        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${GREY};border-bottom:2px solid ${LIME};padding-bottom:6px;margin-bottom:16px;">Job Specifications</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <tbody>
            ${[
            ['Project Name', d.projectName],
            ['Dimensions', d.size],
            ['Quantity', d.quantity + (parseInt(d.quantity) === 1 ? ' unit' : ' units')],
            ['Required Delivery', `<strong style="color:${CHARCOAL};">${formattedDate}</strong>`],
        ].map(([label, value]) => `
            <tr>
              <td style="padding:11px 12px;background:${BG};font-size:13px;font-weight:600;color:${GREY};width:160px;border-radius:4px;">${label}</td>
              <td style="padding:11px 16px;font-size:14px;color:${CHARCOAL};">${value}</td>
            </tr>
            <tr><td colspan="2" style="height:4px;"></td></tr>`).join('')}
          </tbody>
        </table>

        ${d.comments ? `
        <!-- Comments -->
        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${GREY};border-bottom:2px solid ${LIME};padding-bottom:6px;margin-bottom:16px;">Special Requirements / Comments</h2>
        <div style="background:${BG};border-radius:8px;padding:18px 20px;margin-bottom:28px;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${d.comments}</div>
        ` : ''}

        <!-- Files -->
        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${GREY};border-bottom:2px solid ${LIME};padding-bottom:6px;margin-bottom:8px;">Uploaded Files (${d.fileNames.length})</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <tbody>
            ${fileRows}
          </tbody>
        </table>

        <!-- CTA -->
        <div style="text-align:center;">
          <a href="https://supabase.com/dashboard" style="display:inline-block;background:${LIME};color:${CHARCOAL};font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;">
            View Files in Supabase →
          </a>
          <p style="margin:14px 0 0 0;font-size:13px;color:${GREY};">Files are stored in the <strong>client-uploads</strong> bucket under the client's folder.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:${CHARCOAL};padding:24px 36px;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:13px;">Aloe Signs Internal Notification · <a href="mailto:shop@aloesigns.co.za" style="color:${LIME};text-decoration:none;">shop@aloesigns.co.za</a> · 011 693 2600</p>
        <p style="margin:8px 0 0 0;color:#6b7280;font-size:12px;">© ${new Date().getFullYear()} Aloe Signs. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    const data: UploadNotification = await req.json();

    const recipientEmail = process.env.UPLOAD_NOTIFICATION_EMAIL || 'melissa@aloesigns.co.za';

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('SMTP not configured — skipping notification email.');
        return NextResponse.json({ ok: true, skipped: true });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    try {
        await transporter.sendMail({
            from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            subject: `📁 New Upload: ${data.projectName} — ${data.clientName}`,
            html: buildEmailHTML(data),
            text: `New upload from ${data.clientName} (${data.clientEmail}).\nProject: ${data.projectName}\nSize: ${data.size}\nQty: ${data.quantity}\nDelivery: ${data.deliveryDate}\nFiles: ${data.fileNames.join(', ')}\nComments: ${data.comments}`,
        });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Upload notification email failed:', err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
