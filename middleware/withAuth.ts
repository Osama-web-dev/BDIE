import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractAccessToken, TokenPayload } from '@/lib/jwt';

// ─────────────────────────────────────────────────────────────────────────────
// withAuth — HOC that validates the JWT access token before calling the handler.
//
// Usage:
//   export const GET = withAuth(async (req, context, user) => { ... });
//
// On success: injects the decoded token payload as the third argument.
// On failure: returns 401 Unauthorized.
// ─────────────────────────────────────────────────────────────────────────────

export type AuthedHandler = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
    user: TokenPayload
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthedHandler) {
    return async (
        req: NextRequest,
        context: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse> => {
        const token = extractAccessToken(req);

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        try {
            const user = verifyAccessToken(token);
            return await handler(req, context, user);
        } catch {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper to get the client IP from the request headers
// ─────────────────────────────────────────────────────────────────────────────
export function getClientIp(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1'
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard JSON error helper
// ─────────────────────────────────────────────────────────────────────────────
export function apiError(message: string, status: number): NextResponse {
    return NextResponse.json({ error: message }, { status });
}
