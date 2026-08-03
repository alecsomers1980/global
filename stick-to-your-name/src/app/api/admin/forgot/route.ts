import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminByEmail, createReset } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export const runtime = 'nodejs';

// In-memory rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function getClientIP(request: NextRequest): string {
  // Try common headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();

  // Rate limit check
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  if (recent.length > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    // Parse JSON defensively
    let email: string | undefined;
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      // If JSON parsing fails, email remains undefined
      email = undefined;
    }

    if (email && typeof email === 'string' && email.trim()) {
      const admin = await getAdminByEmail(email.trim());
      if (admin) {
        // Generate a secure reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await createReset(token, admin.id, expiresAt);

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const resetUrl = `${siteUrl}/admin/reset?token=${token}`;

        // Best-effort email send
        await sendPasswordResetEmail(admin.email, resetUrl);
      }
      // Intentionally always return ok to not leak existence
    }
    // If email is missing or invalid, still return ok
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Never leak errors to the client
    return NextResponse.json({ ok: true });
  }
}