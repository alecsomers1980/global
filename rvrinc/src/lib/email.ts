import nodemailer from "nodemailer";

// SMTP Configuration from environment variables
const smtpConfig = {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
    },
};

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@rvrinc.co.za";
const FROM_NAME = process.env.SMTP_FROM_NAME || "RVR Inc. Attorneys";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@rvrinc.co.za";

function createTransporter() {
    if (!smtpConfig.host || !smtpConfig.auth.user) {
        console.warn("SMTP not configured. Emails will not be sent.");
        return null;
    }
    return nodemailer.createTransport(smtpConfig);
}

// ─── Branded HTML Wrapper ────────────────────────────────────────
function wrapInTemplate(title: string, bodyHtml: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color:#0f172a; padding: 32px 40px; text-align:center;">
                                <h1 style="color:#d4a843; font-size:24px; margin:0; font-family: Georgia, serif;">
                                    Roets &amp; Van Rensburg
                                </h1>
                                <p style="color:#94a3b8; font-size:12px; margin:4px 0 0; letter-spacing:2px; text-transform:uppercase;">
                                    Attorneys &bull; Prokureurs
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Title Bar -->
                        <tr>
                            <td style="background-color:#d4a843; padding: 12px 40px;">
                                <h2 style="color:#0f172a; font-size:16px; margin:0; font-weight:600;">
                                    ${title}
                                </h2>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 32px 40px; color:#334155; font-size:15px; line-height:1.6;">
                                ${bodyHtml}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                                <p style="margin:0 0 4px; font-size:12px; color:#64748b;">
                                    Roets &amp; Van Rensburg Incorporated
                                </p>
                                <p style="margin:0 0 4px; font-size:12px; color:#94a3b8;">
                                    40 Van Ryneveld Avenue, Pierre van Ryneveld &bull; Tel: 087 150 5683
                                </p>
                                <p style="margin:0; font-size:11px; color:#94a3b8;">
                                    This email is confidential. If you received it in error, please delete it immediately.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

// ─── Email Functions ────────────────────────────────────────────

/**
 * Send a contact form inquiry to the admin/firm
 */
export async function sendContactEmail({
    firstName,
    lastName,
    email,
    practiceArea,
    message,
}: {
    firstName: string;
    lastName: string;
    email: string;
    practiceArea: string;
    message: string;
}) {
    const transporter = createTransporter();
    if (!transporter) {
        console.log("SMTP not configured — contact email skipped");
        return { success: false, error: "Email not configured" };
    }

    const bodyHtml = `
        <p><strong>New enquiry from the website contact form:</strong></p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
            <tr>
                <td style="padding:8px 12px; background:#f1f5f9; font-weight:600; width:140px;">Name</td>
                <td style="padding:8px 12px;">${firstName} ${lastName}</td>
            </tr>
            <tr>
                <td style="padding:8px 12px; background:#f1f5f9; font-weight:600;">Email</td>
                <td style="padding:8px 12px;"><a href="mailto:${email}" style="color:#d4a843;">${email}</a></td>
            </tr>
            <tr>
                <td style="padding:8px 12px; background:#f1f5f9; font-weight:600;">Practice Area</td>
                <td style="padding:8px 12px;">${practiceArea}</td>
            </tr>
        </table>
        <div style="background:#f8fafc; padding:16px; border-left:4px solid #d4a843; border-radius:4px; margin:16px 0;">
            <p style="margin:0; white-space:pre-wrap;">${message}</p>
        </div>
        <p style="font-size:13px; color:#64748b;">Reply directly to this email to respond to the client.</p>
    `;

    try {
        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `New Enquiry: ${practiceArea} — ${firstName} ${lastName}`,
            html: wrapInTemplate("New Contact Enquiry", bodyHtml),
        });

        // Send confirmation to the person who submitted the form
        const confirmHtml = `
            <p>Dear ${firstName},</p>
            <p>Thank you for contacting Roets &amp; Van Rensburg Incorporated. We have received your enquiry regarding <strong>${practiceArea}</strong>.</p>
            <p>A member of our team will review your message and respond within <strong>1-2 business days</strong>.</p>
            <p style="margin-top:24px;">Kind regards,<br><strong>Roets &amp; Van Rensburg Inc.</strong></p>
        `;

        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: email,
            subject: "We received your enquiry — RVR Inc.",
            html: wrapInTemplate("Enquiry Received", confirmHtml),
        });

        return { success: true };
    } catch (error: any) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a notification to a client about a case update
 */
export async function sendCaseUpdateEmail({
    clientEmail,
    clientName,
    caseNumber,
    caseTitle,
    updateMessage,
}: {
    clientEmail: string;
    clientName: string;
    caseNumber: string;
    caseTitle: string;
    updateMessage: string;
}) {
    const transporter = createTransporter();
    if (!transporter) return { success: false, error: "Email not configured" };

    const bodyHtml = `
        <p>Dear ${clientName},</p>
        <p>There is an update on your case:</p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
            <tr>
                <td style="padding:8px 12px; background:#f1f5f9; font-weight:600; width:140px;">Case Number</td>
                <td style="padding:8px 12px;">${caseNumber}</td>
            </tr>
            <tr>
                <td style="padding:8px 12px; background:#f1f5f9; font-weight:600;">Case Title</td>
                <td style="padding:8px 12px;">${caseTitle}</td>
            </tr>
        </table>
        <div style="background:#f8fafc; padding:16px; border-left:4px solid #d4a843; border-radius:4px; margin:16px 0;">
            <p style="margin:0;">${updateMessage}</p>
        </div>
        <p>You can view your case details in the <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://rvrinc.co.za'}/portal/cases" style="color:#d4a843; font-weight:600;">Client Portal</a>.</p>
        <p style="margin-top:24px;">Kind regards,<br><strong>Roets &amp; Van Rensburg Inc.</strong></p>
    `;

    try {
        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: clientEmail,
            subject: `Case Update: ${caseNumber} — ${caseTitle}`,
            html: wrapInTemplate("Case Update", bodyHtml),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Case update email error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a notification to admin/staff about internal events
 */
export async function sendAdminNotification({
    subject,
    message,
    recipientEmail,
}: {
    subject: string;
    message: string;
    recipientEmail?: string;
}) {
    const transporter = createTransporter();
    if (!transporter) return { success: false, error: "Email not configured" };

    const bodyHtml = `
        <div style="background:#f8fafc; padding:16px; border-left:4px solid #d4a843; border-radius:4px;">
            <p style="margin:0; white-space:pre-wrap;">${message}</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to: recipientEmail || ADMIN_EMAIL,
            subject: `[RVR Admin] ${subject}`,
            html: wrapInTemplate(subject, bodyHtml),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Admin notification error:", error);
        return { success: false, error: error.message };
    }
}
