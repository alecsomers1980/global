import crypto from 'crypto';

export const MIN_SUBMIT_MS = 3000;
export const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.ARTWORK_SECRET || process.env.CRON_SECRET;
  if (!value) {
    throw new Error('ARTWORK_SECRET or CRON_SECRET must be set');
  }
  return value;
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

export function signRenderToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${hmac(ts)}`;
}

export function verifyRenderToken(token: unknown): { ok: boolean; reason?: string } {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, reason: 'malformed' };
  }

  const [ts, sig] = token.split('.');
  if (!ts || !sig) {
    return { ok: false, reason: 'malformed' };
  }

  const expected = hmac(ts);
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) {
    return { ok: false, reason: 'bad-signature' };
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { ok: false, reason: 'bad-signature' };
  }

  const age = Date.now() - Number(ts);
  if (Number.isNaN(age)) {
    return { ok: false, reason: 'malformed' };
  }
  if (age < MIN_SUBMIT_MS) {
    return { ok: false, reason: 'too-fast' };
  }
  if (age > MAX_TOKEN_AGE_MS) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true };
}

export function hashIp(ip: string): string {
  return crypto.createHmac('sha256', secret()).update(`ip:${ip}`).digest('hex');
}

export function honeypotTripped(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const website = (body as Record<string, unknown>).website;
  return typeof website === 'string' && website.trim().length > 0;
}

