import { NextResponse } from 'next/server';
import { ensureSchema, insertContactMessage } from '@/lib/db';
import { sendContactNotification } from '@/lib/email';

export const runtime = 'nodejs';

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; start: number }>();

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = body ?? {};

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const trimmedPhone = typeof phone === 'string' ? phone.trim() : undefined;
    // phone is optional, allow empty or undefined

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    if (trimmedMessage.length < 5) {
      return NextResponse.json(
        { error: 'Message must be at least 5 characters long.' },
        { status: 400 }
      );
    }

    await ensureSchema();

    const msg = await insertContactMessage({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      message: trimmedMessage,
    });

    // Best-effort email: do not fail the request if it errors
    sendContactNotification(msg).catch((err) =>
      console.error('Failed to send contact notification email:', err)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Unexpected error in POST /api/contact:', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}