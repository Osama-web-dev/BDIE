import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { RiskSnapshot } from '@/models/RiskSnapshot';
import { withAuth } from '@/middleware/withAuth';

/**
 * Returns the risk snapshot history for an individual user.
 */
export const GET = withAuth(async (req, { params }) => {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '30');

    await connectDB();

    // Fetch snapshots sorted by timestamp descending
    const history = await RiskSnapshot.find({ user_id: id })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

    return NextResponse.json({
        history: history.map(h => ({
            ...h,
            _id: h._id.toString(),
            user_id: h.user_id.toString(),
        })),
    });
});
