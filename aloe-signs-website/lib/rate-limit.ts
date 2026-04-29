import { NextRequest } from 'next/server';

interface RateLimitTracker {
    count: number;
    resetTime: number;
}

// In-memory store for simple rate limiting per serverless function instance.
const ipTracker = new Map<string, RateLimitTracker>();

export function checkRateLimit(request: NextRequest, limit: number = 5, windowMs: number = 60000): { success: boolean; headers: Headers } {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    // Clean up old entries occasionally to prevent memory leaks in long-lived instances
    if (Math.random() < 0.1) {
        for (const [key, tracker] of ipTracker.entries()) {
            if (now > tracker.resetTime) {
                ipTracker.delete(key);
            }
        }
    }

    const currentTracker = ipTracker.get(ip);
    
    const headers = new Headers();

    if (!currentTracker || now > currentTracker.resetTime) {
        // First request or window expired
        ipTracker.set(ip, { count: 1, resetTime: now + windowMs });
        headers.set('X-RateLimit-Limit', limit.toString());
        headers.set('X-RateLimit-Remaining', (limit - 1).toString());
        return { success: true, headers };
    }

    if (currentTracker.count >= limit) {
        // Rate limit exceeded
        headers.set('X-RateLimit-Limit', limit.toString());
        headers.set('X-RateLimit-Remaining', '0');
        headers.set('Retry-After', Math.ceil((currentTracker.resetTime - now) / 1000).toString());
        return { success: false, headers };
    }

    // Increment count
    currentTracker.count++;
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', (limit - currentTracker.count).toString());
    
    return { success: true, headers };
}
