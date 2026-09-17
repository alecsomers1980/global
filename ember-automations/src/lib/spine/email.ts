import { Resend } from "resend";

export type ClientEmailKind = "questions" | "estimate" | "status" | "invite";

export async function sendClientEmail(
  to: string,
  kind: ClientEmailKind,
  vars: { clientName: string; link: string; title?: string }
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM || "Ember Automations <intake@emb3r.co.za>";

  const subject = (() => {
    switch (kind) {
      case "questions": return `A few questions from Ember about ${vars.title ?? "your project"}`;
      case "estimate": return `Your estimate from Ember: ${vars.title ?? "your request"}`;
      case "status": return `Update from Ember: ${vars.title ?? "your request"}`;
      case "invite": return "Connect with Ember Automations";
    }
  })();

  const sentence = (() => {
    switch (kind) {
      case "questions": return "We have a few questions to help us prepare your estimate. Please answer them here:";
      case "estimate": return "Your estimate is ready. Review the details and let us know if you'd like to proceed:";
      case "status": return "There is an update on your request. Please review the details here:";
      case "invite": return "You have been invited to connect with Ember Automations. Use this private link to get started:";
    }
  })();

  const text = [
    `Hi ${vars.clientName},`,
    sentence,
    "",
    vars.link,
    "",
    "This link is private to you and expires in 30 days.",
    "— Ember Automations",
  ].join("\n");

  try {
    const resend = new Resend(key);
    await resend.emails.send({ from, to, subject, text });
    return true;
  } catch (e) {
    console.error("sendClientEmail failed:", e);
    return false;
  }
}
