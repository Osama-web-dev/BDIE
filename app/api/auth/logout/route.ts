import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { extractRefreshToken, verifyRefreshToken } from '@/lib/jwt';
import { verifyTokenHash } from '@/lib/auth';
import { User } from '@/models/User';

/**
 * Logs out the user by clearing cookies and removing the refresh token from DB.
 */
export async function POST(req: NextRequest) {
  const refreshToken = extractRefreshToken(req);

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await connectDB();

      const user = await User.findById(payload.userId).select('+refresh_token_hashes');
      if (user) {
        // Remove this specific refresh token hash from DB
        const hashes = [];
        for (const hash of user.refresh_token_hashes) {
          const isMatch = await verifyTokenHash(refreshToken, hash);
          if (!isMatch) hashes.push(hash);
        }
        user.refresh_token_hashes = hashes;
        await user.save();
      }
    } catch (e) {
      // Ignore token errors during logout
    }
  }

  const response = NextResponse.json({ success: true });

  // Clear cookies
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');

  return response;
}
