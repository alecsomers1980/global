import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** SHA-256 as lowercase hex. Every secret is stored hashed with this. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Cryptographically random base64url string — used for codes and tokens. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * PKCE S256 (RFC 7636): BASE64URL(SHA256(verifier)) must equal the challenge.
 * Compared in constant time so a timing side channel cannot leak the challenge.
 */
export function verifyPkceS256(verifier: string, challenge: string): boolean {
  if (!verifier || !challenge) return false;

  const computed = createHash('sha256').update(verifier).digest('base64url');
  const a = Buffer.from(computed);
  const b = Buffer.from(challenge);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
