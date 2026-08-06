import { NextResponse } from 'next/server';
import { isSpamSubmission } from '@/lib/contact';
import { sendEmail, reportRecipient } from '@/lib/resend';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string; company?: string; renderedAt?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const honeypot = String(body.company ?? '');
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0;

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'Please fill in all fields.' }, { status: 400 });
  }

  if (isSpamSubmission(honeypot, renderedAt, Date.now())) {
    // Pretend success so the bot doesn't learn its submission was rejected.
    return NextResponse.json({ ok: true });
  }

  const to = reportRecipient();
  if (!to) {
    console.error('[contact] REPORT_RECIPIENT_EMAIL not configured');
    return NextResponse.json(
      { ok: false, error: 'Contact form is not yet configured. Please WhatsApp Donald directly.' },
      { status: 503 },
    );
  }

  const result = await sendEmail({
    to,
    replyTo: email,
    subject: `New enquiry from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br>')}</p>`,
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'Failed to send. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
