import { Resend } from "resend";

/** Lazy-init so a missing key never crashes a build or an unrelated route —
 *  the same guard used in everest-motoring. Email is best-effort: a send that
 *  fails must never fail the request that triggered it (an order is still
 *  paid whether or not the receipt goes out). */

let client: Resend | null = null;

function getResend(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ||
  "Diana's Bulbinella <onboarding@resend.dev>";

export type SendResult = { success: boolean; error?: string };

export type Attachment = { filename: string; content: Buffer };

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn("[resend] skipped, RESEND_API_KEY is not set:", subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments
        ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
        : {}),
    });
    if (error) {
      console.error("[resend]", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[resend]", err);
    return { success: false, error: err?.message || "Send failed" };
  }
}

/** Where order notifications and the monthly report go. */
export function reportRecipient(): string | null {
  return process.env.REPORT_RECIPIENT_EMAIL || null;
}
