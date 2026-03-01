import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { comparePassword, sanitizeUser, hashToken } from '@/lib/auth';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { User } from '@/models/User';
import { withAuthRateLimit } from '@/middleware/withRateLimit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const isProduction = process.env.NODE_ENV === 'production';

export const POST = withAuthRateLimit(async (req: NextRequest) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { email, password } = parsed.data;

  await connectDB();

  // Find user and explicitly include password_hash
  const user = await User.findOne({ email }).select('+password_hash +refresh_token_hashes');

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Check if account is locked
  if (user.locked_until && user.locked_until > new Date()) {
    return NextResponse.json({
      error: `Account locked. Try again after ${user.locked_until.toLocaleTimeString()}`
    }, { status: 403 });
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    // Increment failed attempts
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      user.failed_login_attempts = 0;
    }
    await user.save();
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Success - reset failures
  user.failed_login_attempts = 0;
  user.locked_until = null;
  user.last_login = new Date();

  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);
  const refreshHash = await hashToken(refreshToken);

  // Store refresh token hash (limit to last 5 sessions)
  user.refresh_token_hashes.push(refreshHash);
  if (user.refresh_token_hashes.length > 5) {
    user.refresh_token_hashes.shift();
  }

  await user.save();

  const response = NextResponse.json({
    user: sanitizeUser(user.toObject()),
    access_token: accessToken,
  });

  // Set httpOnly cookies
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 mins
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600, // 7 days
    path: '/api/auth', // Only sent to refresh/logout endpoints
  });

  return response;
});
