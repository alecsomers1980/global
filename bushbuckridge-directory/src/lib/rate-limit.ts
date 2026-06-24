import { headers } from 'next/headers'

/**
 * Simple in-memory fixed-window rate limiter for public form submissions.
 *
 * This is a first-line abuse guard: it is per-server-instance and resets on
 * cold start, so it is not a distributed/global limit. For a low-traffic site
 * it effectively stops a single source from hammering an endpoint, at zero cost
 * and with no third-party dependency. Upgrade to Upstash Redis or Cloudflare
 * Turnstile later if abuse becomes a real problem.
 */
type Entry = { count: number; resetAt: number }
const buckets = new Map<string, Entry>()

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterMs: 0 }
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count += 1
  return { ok: true, retryAfterMs: 0 }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers()
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') || 'unknown'
}
