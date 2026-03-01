import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';
import { User } from '@/models/User';
import { withAuth } from '@/middleware/withAuth';

/**
 * Returns the current user's profile information.
 */
export const GET = withAuth(async (req, ctx, auth) => {
  await connectDB();

  const user = await User.findById(auth.userId).lean();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    user: sanitizeUser(user),
  });
});
