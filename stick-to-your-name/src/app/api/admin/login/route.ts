import { verifyAdminLogin, createSessionCookie } from '@/lib/admin';
import { ensureSchema } from '@/lib/db';

export const runtime = 'nodejs';

const attempts = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // --- Rate limiting ---
  const now = Date.now();
  const timestamps = attempts.get(ip) || [];
  const recent = timestamps.filter(t => now - t < 60_000);
  if (recent.length >= 5) {
    return Response.json({ error: 'Too many attempts, please wait a minute.' }, { status: 429 });
  }
  recent.push(now);
  attempts.set(ip, recent);

  // --- Parse body ---
  let email: string;
  let password: string;
  let remember: boolean;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
    remember = !!body.remember;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Ensure the admin row exists (seeds from env on first run).
  await ensureSchema();

  const admin = await verifyAdminLogin(email, password);
  if (admin) {
    await createSessionCookie(admin.id, remember);
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'Invalid email or password' }, { status: 401 });
}
