import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { computeRisk } from '@/lib/riskEngine';
import { withRole } from '@/middleware/withRole';
import { recordAudit } from '@/lib/logging';

/**
 * Triggers a manual risk recalculation for a specific user or all users.
 */
export const POST = withRole(['admin', 'analyst'], async (req: NextRequest, ctx, auth) => {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    await connectDB();

    try {
        if (userId) {
            const result = await computeRisk(userId, 'manual_admin_trigger');
            await recordAudit(auth.userId, 'risk.recalculate', 'user', userId, { scope: 'individual' }, req);
            return NextResponse.json({ success: true, user_id: userId, score: result.score });
        } else {
            // Trigger all active users
            const users = await User.find({ status: 'active' }).select('_id').lean();
            for (const u of users) {
                await computeRisk(u._id.toString(), 'manual_admin_bulk_trigger');
            }
            await recordAudit(auth.userId, 'risk.recalculate', 'system', null, { scope: 'all', count: users.length }, req);
            return NextResponse.json({ success: true, message: `Recalculated risk for ${users.length} users.` });
        }
    } catch (err) {
        return NextResponse.json({ error: 'Recalculation failed' }, { status: 500 });
    }
});
