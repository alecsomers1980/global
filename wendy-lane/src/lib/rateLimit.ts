import type { NextRequest } from "next/server";

/**
 * In-memory rate limit. Good enough to stop casual form spam on a single
 * instance; it resets on deploy and is not shared across serverless instances.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
