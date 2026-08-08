import { NextResponse } from 'next/server';
import { validateQuote, isBot } from '@/lib/quote-schema';
import { sendQuoteNotification, sendQuoteAutoReply } from '@/lib/email';

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: 'Invalid request.' } },
      { status: 400 }
    );
  }

  // Honeypot & timing check — silently accept to avoid giving bots any signal
  if (isBot({ website: body.website as string, renderedAt: body.renderedAt as number })) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const validation = validateQuote(body);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, errors: validation.errors },
      { status: 400 }
    );
  }

  try {
    await sendQuoteNotification(validation.data);
    await sendQuoteAutoReply(validation.data);
  } catch (error) {
    console.error('quote send failed', error);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: 'We could not send that just now. Please phone or WhatsApp us instead.',
        },
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
