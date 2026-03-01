import { NextResponse } from 'next/server';
import { UserRole } from '@/models/User';
import { TokenPayload } from '@/lib/jwt';
import { AuthedHandler, withAuth } from './withAuth';
import { NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// withRole — Extends withAuth to enforce role-based access control.
//
// Usage:
//   export const POST = withRole(['admin', 'analyst'], async (req, ctx, user) => { ... });
//
// Returns 403 Forbidden if the user's role is not in the allowed list.
// ─────────────────────────────────────────────────────────────────────────────

export function withRole(allowedRoles: UserRole[], handler: AuthedHandler) {
    return withAuth(async (
        req: NextRequest,
        context: { params: Promise<Record<string, string>> },
        user: TokenPayload
    ) => {
        if (!allowedRoles.includes(user.role as UserRole)) {
            return NextResponse.json(
                {
                    error: 'Insufficient permissions',
                    required: allowedRoles,
                    current: user.role,
                },
                { status: 403 }
            );
        }
        return handler(req, context, user);
    });
}
