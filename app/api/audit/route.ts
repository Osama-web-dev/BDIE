import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuditLog } from '@/models/AuditLog';
import { withRole } from '@/middleware/withRole';

/**
 * Returns a paginated audit log (Admin Only).
 */
export const GET = withRole(['admin'], async (req: NextRequest) => {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const action = url.searchParams.get('action');

    await connectDB();

    const query: any = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await AuditLog.countDocuments(query);

    return NextResponse.json({
        logs,
        pagination: { total, limit, skip },
    });
});
