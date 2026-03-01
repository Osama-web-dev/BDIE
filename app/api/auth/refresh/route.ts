import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyRefreshToken, signAccessToken, extractRefreshToken } from '@/lib/jwt';
import { verifyTokenHash } from '@/lib/auth';
import { User } from '@/models/User';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Rotates the access token using a valid refresh token cookie.
 * Verifies the refresh token exists in the user's whitelist in the DB.
 */
export async function POST(req: NextRequest) {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
        return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    try {
        const payload = verifyRefreshToken(refreshToken);

        await connectDB();
        const user = await User.findById(payload.userId).select('+refresh_token_hashes');

        if (!user || user.status !== 'active') {
            return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
        }

        // Verify token exists in user's active session hashes
        let isValidHash = false;
        for (const hash of user.refresh_token_hashes) {
            if (await verifyTokenHash(refreshToken, hash)) {
                isValidHash = true;
                break;
            }
        }

        if (!isValidHash) {
            // Potential token theft/reuse. In a real prod app, you might clear all tokens here.
            return NextResponse.json({ error: 'Invalid refresh token session' }, { status: 401 });
        }

        // Issue new access token
        const newAccessToken = signAccessToken({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        const response = NextResponse.json({ access_token: newAccessToken });

        response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60,
        });

        return response;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }
}
