import { Resend } from "resend";
import { BUSINESS } from "@/data/business";

/**
 * Resend is created lazily and may be null — the site must keep working (and the
 * form must fail loudly but safely) when RESEND_API_KEY isn't configured yet.
 */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Until wozawendylane.co.za is verified in Resend, `onboarding@resend.dev` is the
 * only address Resend will send from. Swap LEAD_FROM_EMAIL once the domain is verified.
 */
const FROM_EMAIL = process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev";
const FROM = `Wendy Lane Website <${FROM_EMAIL}>`;
const TO_EMAIL = process.env.LEAD_TO_EMAIL || BUSINESS.email;

export type Lead = {
  name: string;
  phone: string;
  email?: string;
  town?: string;
  message?: string;
  /** Pre-built summary from the quote calculator, when the lead came from /quote. */
  quoteSummary?: string;
  /** Opted in to specials/updates — separate from the enquiry itself (POPIA: distinct consent for marketing). */
  marketingConsent?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(lead: Lead) {
  const row = (label: string, value?: string) =>
    value
      ? `<tr>
           <td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;">${label}</td>
           <td style="padding:6px 0;color:#111;font-weight:600;">${escapeHtml(value)}</td>
         </tr>`
      : "";

  const quoteBlock = lead.quoteSummary
    ? `<h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Quote they built</h3>
       <pre style="margin:0;padding:12px;background:#F0F9F0;border-left:3px solid #0E7C0F;border-radius:6px;font:13px/1.6 monospace;white-space:pre-wrap;color:#111;">${escapeHtml(
         lead.quoteSummary,
       )}</pre>`
    : "";

  const messageBlock = lead.message
    ? `<h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Message</h3>
       <p style="margin:0;padding:12px;background:#FAFAFA;border-radius:6px;color:#111;white-space:pre-wrap;">${escapeHtml(
         lead.message,
       )}</p>`
    : "";

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px;">
    <h2 style="margin:0 0 4px;color:#0E7C0F;">New website enquiry</h2>
    <p style="margin:0 0 20px;color:#666;font-size:14px;">via wozawendylane.co.za</p>
    <table style="border-collapse:collapse;font-size:14px;">
      ${row("Name", lead.name)}
      ${row("Phone", lead.phone)}
      ${row("Email", lead.email)}
      ${row("Town", lead.town)}
      ${row("OK to send specials?", lead.marketingConsent ? "Yes, opted in" : "No")}
    </table>
    ${quoteBlock}
    ${messageBlock}
  </div>`;
}

function buildText(lead: Lead) {
  return [
    "New website enquiry — wozawendylane.co.za",
    "",
    `Name:  ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.town ? `Town:  ${lead.town}` : null,
    `OK to send specials?: ${lead.marketingConsent ? "Yes, opted in" : "No"}`,
    lead.quoteSummary ? `\nQuote they built:\n${lead.quoteSummary}` : null,
    lead.message ? `\nMessage:\n${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendLeadEmail(
  lead: Lead,
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — lead email not sent.", lead);
    return { success: false, error: "Email is not configured yet." };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO_EMAIL],
      replyTo: lead.email || undefined,
      subject: `New enquiry — ${lead.name}${lead.town ? ` (${lead.town})` : ""}`,
      html: buildHtml(lead),
      text: buildText(lead),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Could not send your enquiry." };
    }
    return { success: true };
  } catch (err) {
    console.error("Lead email failed:", err);
    return { success: false, error: "Could not send your enquiry." };
  }
}
