import { Resend } from 'resend';

let client: Resend | null = null;

function getResend(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Caracal Footwear <onboarding@resend.dev>';

export type SendResult = { success: boolean; error?: string };

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn('[resend] skipped, RESEND_API_KEY is not set:', subject);
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('[resend]', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('[resend]', err);
    return { success: false, error: err instanceof Error ? err.message : 'Send failed' };
  }
}

/** Where order and stock-conflict notifications go. */
export function reportRecipient(): string | null {
  return process.env.REPORT_RECIPIENT_EMAIL || null;
}