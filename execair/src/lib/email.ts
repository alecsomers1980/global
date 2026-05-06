import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Exec-Air <noreply@execair.co.za>";
const TO = process.env.NOTIFICATION_EMAIL || "info@execair.co.za";

interface FollowUpEnquiry {
  id: string;
  customer_name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  enquiry_details: string;
  quote_value: number;
  status: string;
  priority: string;
  follow_up_date: string;
  notes: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: "New",
  warm_lead: "Warm Lead",
  confirmed: "Confirmed",
  on_hold: "On Hold",
  no_answer: "No Answer",
};

function generateEmailHtml(enquiries: FollowUpEnquiry[]): string {
  const highPriority = enquiries.filter((e) => e.priority === "high");
  const standard = enquiries.filter((e) => e.priority !== "high");
  const totalQuoteValue = enquiries.reduce((sum, e) => sum + (e.quote_value || 0), 0);

  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function enquiryRows(list: FollowUpEnquiry[]) {
    return list
      .map(
        (e) => `
      <tr>
        <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb;">
          <strong style="color:#0a1628;">${e.customer_name}</strong>
          ${e.company ? `<br><span style="color:#6b7280; font-size:13px;">${e.company}</span>` : ""}
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#374151;">
          ${new Date(e.follow_up_date).toLocaleDateString("en-ZA")}
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;
            ${e.priority === "high" ? "background:#fef2f2; color:#dc2626;" : "background:#f3f4f6; color:#6b7280;"}">
            ${e.priority === "high" ? "⚠ High" : "Standard"}
          </span>
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;
            background:#e0f2fe; color:#0369a1;">
            ${statusLabels[e.status] || e.status}
          </span>
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:600; color:#0a1628;">
          ${e.quote_value ? `R ${e.quote_value.toLocaleString()}` : "—"}
        </td>
      </tr>`
      )
      .join("");
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0a1628; padding:32px 40px; text-align:center;">
              <h1 style="color:#0097b2; font-size:20px; margin:0; letter-spacing:1px; text-transform:uppercase;">Exec-Air</h1>
              <p style="color:#94a3b8; font-size:12px; margin:6px 0 0; letter-spacing:2px; text-transform:uppercase;">
                Daily Follow-Up Report
              </p>
            </td>
          </tr>

          <!-- Summary Bar -->
          <tr>
            <td style="background:#0097b2; padding:16px 40px;">
              <p style="color:#fff; font-size:14px; margin:0;">
                ${today} &nbsp;|&nbsp;
                <strong>${enquiries.length}</strong> follow-ups due &nbsp;|&nbsp;
                <strong>${highPriority.length}</strong> high priority &nbsp;|&nbsp;
                Total quotes: <strong>R ${totalQuoteValue.toLocaleString()}</strong>
              </p>
            </td>
          </tr>

          <!-- High Priority Section -->
          ${highPriority.length > 0 ? `
          <tr>
            <td style="padding:24px 40px 8px;">
              <h2 style="color:#dc2626; font-size:16px; margin:0;">🔴 High Priority — ${highPriority.length} enquiries</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Customer</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Follow-up Date</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Priority</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Status</th>
                    <th style="padding:10px 16px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Quote</th>
                  </tr>
                </thead>
                <tbody>${enquiryRows(highPriority)}</tbody>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Standard Priority Section -->
          ${standard.length > 0 ? `
          <tr>
            <td style="padding:24px 40px 8px;">
              <h2 style="color:#0a1628; font-size:16px; margin:0;">🟡 Standard Priority — ${standard.length} enquiries</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Customer</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Follow-up Date</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Priority</th>
                    <th style="padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Status</th>
                    <th style="padding:10px 16px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280;">Quote</th>
                  </tr>
                </thead>
                <tbody>${enquiryRows(standard)}</tbody>
              </table>
            </td>
          </tr>
          ` : ""}

          ${enquiries.length === 0 ? `
          <tr>
            <td style="padding:48px 40px; text-align:center;">
              <p style="color:#6b7280; font-size:16px; margin:0;">✅ No follow-ups due today</p>
              <p style="color:#9ca3af; font-size:14px; margin:4px 0 0;">Great work staying on top of your enquiries!</p>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:20px 40px; border-top:1px solid #e5e7eb; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#6b7280;">
                Exec-Air Air Conditioning &bull; 296 Voortrekker Road, Krugersdorp &bull; +27 11 477 3920
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/admin" style="font-size:12px; color:#0097b2; text-decoration:none;">
                View in Admin Panel →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface QuoteNotification {
  customer_name: string;
  email: string;
  phone: string;
  company: string | null;
  product_name: string;
  product_btu: string;
  message: string;
}

export async function sendQuoteNotification(quote: QuoteNotification) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.log("Resend not configured — quote email skipped");
    return { success: false, error: "Resend API key not configured" };
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#0a1628; padding:28px 32px;">
              <h1 style="color:#0097b2; font-size:18px; margin:0; letter-spacing:1px;">EXEC-AIR</h1>
              <p style="color:#94a3b8; font-size:12px; margin:4px 0 0; letter-spacing:2px;">NEW PRODUCT QUOTE REQUEST</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr>
                  <td style="padding:12px 16px; background:#f0fdfa; border-radius:8px;">
                    <p style="margin:0; color:#0f766e; font-weight:600; font-size:16px;">${quote.product_name}</p>
                    <p style="margin:2px 0 0; color:#0f766e; font-size:13px;">${quote.product_btu}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-top:20px;">
                <tr><td style="padding:8px 0; color:#6b7280; width:100px;">Name</td><td style="padding:8px 0; color:#0a1628; font-weight:500;">${quote.customer_name}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${quote.email}" style="color:#0097b2;">${quote.email}</a></td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Phone</td><td style="padding:8px 0; color:#0a1628; font-weight:500;">${quote.phone}</td></tr>
                ${quote.company ? `<tr><td style="padding:8px 0; color:#6b7280;">Company</td><td style="padding:8px 0; color:#0a1628; font-weight:500;">${quote.company}</td></tr>` : ""}
                ${quote.message ? `<tr><td style="padding:8px 0; color:#6b7280; vertical-align:top;">Message</td><td style="padding:8px 0; color:#374151;">${quote.message.replace(/\n/g, "<br>")}</td></tr>` : ""}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
              <p style="margin:0; font-size:11px; color:#6b7280;">
                Exec-Air Air Conditioning &bull; 296 Voortrekker Road, Krugersdorp &bull; +27 11 477 3920
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `Quote Request: ${quote.product_name} — ${quote.customer_name}`,
      html,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Quote notification email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendFollowUpReport(enquiries: FollowUpEnquiry[]) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.log("Resend not configured — email skipped");
    return { success: false, error: "Resend API key not configured" };
  }

  const highPriority = enquiries.filter((e) => e.priority === "high");

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `📋 Exec-Air Follow-Up Report — ${enquiries.length} due${highPriority.length > 0 ? ` (${highPriority.length} urgent)` : ""}`,
      html: generateEmailHtml(enquiries),
    });

    return { success: true, sent: enquiries.length };
  } catch (error: any) {
    console.error("Follow-up email error:", error);
    return { success: false, error: error.message };
  }
}
