// Lightweight in-memory rate limiter. Resets per serverless instance/cold start —
// not a substitute for a shared store (Redis/Upstash) under heavy multi-instance load,
// but stops basic abuse/spam on public form endpoints with zero added infra.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }

    bucket.count++;
    return bucket.count > limit;
}

export function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0].trim() || "unknown";
}
