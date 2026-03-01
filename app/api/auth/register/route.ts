import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { hashToken } from '@/lib/auth';
import { User } from '@/models/User';
import { withAuthRateLimit } from '@/middleware/withRateLimit';

const RegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    department: z.string().min(1).max(100),
    role: z.enum(['admin', 'analyst', 'viewer']).optional().default('viewer'),
});

const isProduction = process.env.NODE_ENV === 'production';

export const POST = withAuthRateLimit(async (req: NextRequest) => {
    // In production, require ENABLE_REGISTRATION=true or an existing admin token
    if (isProduction && process.env.ENABLE_REGISTRATION !== 'true') {
        return NextResponse.json({ error: 'Registration is disabled' }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
    }

    const { name, email, password, department, role } = parsed.data;

    // Password strength validation
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
        return NextResponse.json({ error: strength.message }, { status: 422 });
    }

    await connectDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password_hash,
        role,
        department,
        status: 'active',
        baseline_profile: {
            avg_login_hour: 9,
            avg_session_duration: 480,
            avg_file_access_per_day: 20,
            avg_communication_score: 70,
            typical_ips: [],
        },
    });

    const tokenPayload = { userId: user._id.toString(), role: user.role, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const refreshHash = await hashToken(refreshToken);

    await User.findByIdAndUpdate(user._id, {
        $push: { refresh_token_hashes: { $each: [refreshHash], $slice: -5 } },
    });

    const response = NextResponse.json({
        user: { _id: user._id, name, email, role, department, status: 'active' },
        access_token: accessToken,
    }, { status: 201 });

    response.cookies.set('access_token', accessToken, {
        httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 15 * 60,
    });
    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/api/auth',
    });

    return response;
});
