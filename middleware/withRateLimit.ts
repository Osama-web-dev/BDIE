import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate limiter using LRU cache.
//
// In production with multiple instances, use @upstash/ratelimit instead.
// This implementation is correct for single-process (Vercel serverless, local dev).
//
// Limits:
//   - Auth endpoints: 5 requests per minute per IP
//   - General API: 100 requests per minute per IP
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const cache = new LRUCache<string, RateLimitRecord>({
    max: 5000,  // track up to 5000 unique IP+endpoint combinations
    ttl: 60_000, // 60 seconds
});

function isRateLimited(key: string, limit: number): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = cache.get(key);

    if (!record || now > record.resetAt) {
        cache.set(key, { count: 1, resetAt: now + 60_000 });
        return { limited: false, remaining: limit - 1, resetAt: now + 60_000 };
    }

    if (record.count >= limit) {
        return { limited: true, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    cache.set(key, record);
    return { limited: false, remaining: limit - record.count, resetAt: record.resetAt };
}

function getIp(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1'
    );
}

// ─── High-security rate limit (5 req/min) — for auth endpoints ───────────────
export function withAuthRateLimit<T extends unknown[]>(
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
    return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
        const ip = getIp(req);
        const key = `auth:${ip}`;
        const { limited, remaining, resetAt } = isRateLimited(key, 5);

        if (limited) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait before trying again.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
                        'Retry-After': '60',
                    },
                }
            );
        }

        const response = await handler(req, ...args);
        response.headers.set('X-RateLimit-Limit', '5');
        response.headers.set('X-RateLimit-Remaining', String(remaining));
        return response;
    };
}

// ─── Standard rate limit (100 req/min) — for all other API routes ────────────
export function withRateLimit<T extends unknown[]>(
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
    return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
        const ip = getIp(req);
        const key = `api:${ip}:${req.nextUrl.pathname}`;
        const { limited, remaining } = isRateLimited(key, 100);

        if (limited) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        const response = await handler(req, ...args);
        response.headers.set('X-RateLimit-Remaining', String(remaining));
        return response;
    };
}
