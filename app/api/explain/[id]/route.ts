import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { explainRisk } from '@/lib/explainability';
import { withRole } from '@/middleware/withRole';

/**
 * Returns a human-readable AI explanation for a user's latest risk snapshot.
 */
export const GET = withRole(['admin', 'analyst'], async (req, { params }) => {
    const { id } = await params;

    await connectDB();

    try {
        const explanation = await explainRisk(id);
        return NextResponse.json({ explanation });
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : 'Failed to generate explanation'
        }, { status: 404 });
    }
});
