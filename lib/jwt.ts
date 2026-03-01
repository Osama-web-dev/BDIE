import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'bdie-access-secret-change-in-production-min-64-chars';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bdie-refresh-secret-change-in-production-min-64-chars';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: string;
    role: string;
    email: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Access token — short-lived (15 min), used to authenticate API requests.
// Sent as httpOnly cookie AND in response body for SPA state rehydration.
// ─────────────────────────────────────────────────────────────────────────────
export function signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
        issuer: 'bdie',
        audience: 'bdie-client',
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh token — long-lived (7d), stored httpOnly. Used only by /api/auth/refresh.
// A hashed version is stored on the User document for revocation.
// ─────────────────────────────────────────────────────────────────────────────
export function signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
        issuer: 'bdie',
        audience: 'bdie-client',
    });
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_SECRET, {
        issuer: 'bdie',
        audience: 'bdie-client',
    }) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, REFRESH_SECRET, {
        issuer: 'bdie',
        audience: 'bdie-client',
    }) as TokenPayload;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract bearer token from Authorization header or cookie
// ─────────────────────────────────────────────────────────────────────────────
export function extractAccessToken(req: Request): string | null {
    // Prefer Authorization: Bearer header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    // Fall back to cookie (the cookie-based approach for SSR)
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function extractRefreshToken(req: Request): string | null {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}
