import { verifyAdminPassword, createSessionCookie } from '@/lib/admin';

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
  let password: string;
  try {
    const body = await req.json();
    password = body.password;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (await verifyAdminPassword(password)) {
    await createSessionCookie();
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'Invalid password' }, { status: 401 });
}
