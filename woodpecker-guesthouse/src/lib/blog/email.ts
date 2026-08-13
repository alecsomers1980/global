import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://woodpeckersguesthouse.co.za";

/** Notifies the admin that new AI-drafted blog posts are waiting for review.
 *  Reuses RESEND_API_KEY + CONTACT_TO_EMAIL — the same pair the contact form
 *  already uses — rather than inventing a dedicated admin-email env var. */
export async function sendBlogReviewEmail(opts: { titles: string[] }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.warn("[blog-email] RESEND_API_KEY or CONTACT_TO_EMAIL not configured — skipping review email.");
    return false;
  }

  const reviewUrl = `${SITE_URL}/admin/blog`;
  const listItems = opts.titles.map((t) => `<li>${t}</li>`).join("");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Woodpecker Guesthouse Website <onboarding@resend.dev>",
    to,
    subject: `${opts.titles.length} new blog draft${opts.titles.length === 1 ? "" : "s"} awaiting review`,
    html: `<p>New AI-drafted blog posts are ready for your review. They will only go live once you approve them.</p><ul>${listItems}</ul><p><a href="${reviewUrl}">Review in the admin panel</a></p>`,
    text: `New AI-drafted blog posts are ready for review:\n\n${opts.titles.map((t) => `- ${t}`).join("\n")}\n\nReview here: ${reviewUrl}`,
  });

  if (error) {
    console.error("[blog-email] Resend error:", error);
    return false;
  }
  return true;
}