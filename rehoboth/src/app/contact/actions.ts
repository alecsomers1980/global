"use server";

import { getServerClient } from "@/lib/supabase/server";
import { isBot } from "@/lib/bot-guard";

export type ContactResult = { ok: true } | { ok: false; error: string };

const MAX = 4000;
const FALLBACK_ERROR =
  "We could not send that just now. Please phone us on 082 824 9023.";

/**
 * A message from the contact form.
 *
 * The row is written FIRST and the email attempted afterwards. Email is the
 * part that fails silently — a lapsed certificate or an unpaid account will
 * drop mail for months while the sender sees a thank-you screen. The stored
 * row is the record; the admin inbox reads it whether the email went or not.
 */
export async function sendContactMessage(form: FormData): Promise<ContactResult> {
  if (isBot({ company: form.get("company"), renderedAt: form.get("renderedAt") })) {
    // Look like success, write nothing.
    return { ok: true };
  }

  const value = (k: string) => String(form.get(k) ?? "").trim().slice(0, MAX);
  const row = {
    name: value("name"),
    email: value("email").toLowerCase(),
    phone: value("phone") || null,
    subject: value("subject") || null,
    message: value("message"),
  };

  if (!row.name || !row.email || !row.message) {
    return { ok: false, error: "Please fill in your name, email and message." };
  }
  if (!row.email.includes("@")) {
    return { ok: false, error: "That email address does not look right." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[contact] Supabase is not configured — message dropped");
    return { ok: false, error: FALLBACK_ERROR };
  }

  const db = getServerClient();
  const { data, error } = await db
    .from("contact_messages")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[contact] insert failed", error.message);
    return { ok: false, error: FALLBACK_ERROR };
  }

  // Best effort. A failure here is logged and flagged on the row, never shown
  // to the sender — their message is already safely stored.
  try {
    const sent = await notify(row);
    if (sent) await db.from("contact_messages").update({ emailed: true }).eq("id", data.id);
  } catch (e) {
    console.error("[contact] notification email failed", e);
  }

  return { ok: true };
}

async function notify(row: {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) return false;

  const { Resend } = await import("resend");
  const { error } = await new Resend(key).emails.send({
    from: "Rehoboth Herbal Co. <orders@rehobothherbal.co.za>",
    to,
    replyTo: row.email,
    subject: `Website enquiry — ${row.subject ?? "no subject"}`,
    text: [
      `From: ${row.name} <${row.email}>`,
      row.phone ? `Phone: ${row.phone}` : null,
      row.subject ? `About: ${row.subject}` : null,
      "",
      row.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("[contact] resend rejected the message", error);
    return false;
  }
  return true;
}
