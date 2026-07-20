import { Resend } from "resend";

export async function notifySubmission(qn: {
  client_name: string; project_name: string; slug: string; id?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return; // no-op if unconfigured (e.g. local without keys)

  const resend = new Resend(key);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/${qn.id ?? ""}`;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "Ember Automations <intake@emb3r.co.za>",
      to,
      subject: `New intake: ${qn.client_name} — ${qn.project_name}`,
      text: `${qn.client_name} submitted the "${qn.project_name}" questionnaire.\n\nReview: ${url}`,
    });
  } catch (e) {
    // Never let a mail failure break the client's submission.
    console.error("notifySubmission failed:", e);
  }
}
