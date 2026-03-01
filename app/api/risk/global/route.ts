import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withAuth } from '@/middleware/withAuth';

/**
 * Provides global risk statistics and department-level aggregates for the dashboard.
 */
export const GET = withAuth(async () => {
    await connectDB();

    // 1. Calculate weighted global risk score
    const users = await User.find({ status: 'active' }).select('risk_score department').lean();

    if (!users.length) {
        return NextResponse.json({
            global_score: 0,
            user_count: 0,
            departments: [],
        });
    }

    const totalScore = users.reduce((sum, u) => sum + (u.risk_score || 0), 0);
    const globalScore = Math.round(totalScore / users.length);

    // 2. Aggregate by department
    const deptMap: Record<string, { total: number; count: number }> = {};
    users.forEach(u => {
        if (!deptMap[u.department]) {
            deptMap[u.department] = { total: 0, count: 0 };
        }
        deptMap[u.department].total += (u.risk_score || 0);
        deptMap[u.department].count += 1;
    });

    const departments = Object.entries(deptMap).map(([name, stats]) => ({
        name,
        avg_score: Math.round(stats.total / stats.count),
        user_count: stats.count,
        severity: (stats.total / stats.count) > 75 ? 'critical' : (stats.total / stats.count) > 50 ? 'high' : 'normal',
    }));

    // 3. Risk distribution buckets
    const distribution = {
        low: users.filter(u => u.risk_score < 30).length,
        medium: users.filter(u => u.risk_score >= 30 && u.risk_score < 60).length,
        high: users.filter(u => u.risk_score >= 60 && u.risk_score < 80).length,
        critical: users.filter(u => u.risk_score >= 80).length,
    };

    return NextResponse.json({
        global_score: globalScore,
        user_count: users.length,
        departments: departments.sort((a, b) => b.avg_score - a.avg_score),
        distribution,
    });
});
