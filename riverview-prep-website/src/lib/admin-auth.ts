import { NextResponse } from 'next/server';

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 1000; // matches the cookie's maxAge in api/admin/login

/**
 * Gate for admin-only API routes (delete-image, upload, newsletter send).
 *
 * The login route sets `admin-session` to base64(`${username}:${issuedAt}:${JWT_SECRET}`).
 * Middleware only protects /admin/:path*, not /api/*, so every API route that
 * mutates data must call this itself. It fails closed: a missing/misconfigured
 * secret means nobody gets in, and a cookie that doesn't decode to a value
 * containing the current secret (or that's older than the login cookie's own
 * maxAge) is rejected rather than just checked for presence.
 */
export function requireAdminSession(req: Request): NextResponse | null {
  const username = process.env.ADMIN_USERNAME;
  const secret = process.env.JWT_SECRET;

  if (!username || !secret) {
    console.error('ADMIN_USERNAME/JWT_SECRET not set — admin route refused.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin-session=([^;]+)/);
  const session = match?.[1];
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded: string;
  try {
    decoded = Buffer.from(decodeURIComponent(session), 'base64').toString('utf-8');
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parts = decoded.split(':');
  if (parts.length !== 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [tokenUsername, issuedAtStr, tokenSecret] = parts;
  const issuedAt = Number(issuedAtStr);

  if (
    tokenUsername !== username ||
    tokenSecret !== secret ||
    !Number.isFinite(issuedAt) ||
    Date.now() - issuedAt > SESSION_MAX_AGE_MS
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
