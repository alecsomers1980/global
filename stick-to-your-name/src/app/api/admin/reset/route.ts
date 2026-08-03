import bcrypt from 'bcryptjs';
import { getReset, markResetUsed, updateAdminPassword } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { token, password } = body || {};

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token is required.' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const reset = await getReset(token);
    if (!reset || reset.used || new Date(reset.expires_at) < new Date()) {
      return Response.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await updateAdminPassword(reset.admin_id, hash);
    await markResetUsed(token);

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}