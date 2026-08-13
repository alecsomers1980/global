import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isBotSubmission } from "@/lib/antibot";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; topic?: string; honeypot?: string; renderedAt?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const topic = String(body.topic ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Please fill in all fields." }, { status: 400 });
  }

  if (isBotSubmission({ honeypot: body.honeypot, renderedAt: body.renderedAt })) {
    // Pretend success without sending — don't tip off the bot.
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not configured");
    return NextResponse.json(
      { ok: false, error: "Contact form is not yet configured. Please email us directly." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Woodpecker Guesthouse Website <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: topic ? `New enquiry (${topic}) from ${name}` : `New enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}${topic ? `\nRegarding: ${topic}` : ""}\n\n${message}`,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json({ ok: false, error: "Failed to send. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}