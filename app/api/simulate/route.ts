import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { runSimulation } from '@/lib/simulationEngine';
import { withRole } from '@/middleware/withRole';

const LaunchSimulationSchema = z.object({
  scenario: z.enum(['privilege_escalation', 'data_hoarding', 'suspicious_logins', 'tone_shift']),
  target_user_id: z.string().min(1),
});

/**
 * Executes a risk simulation scenario.
 * Admin/Analyst only.
 */
export const POST = withRole(['admin', 'analyst'], async (req: NextRequest, ctx, auth) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = LaunchSimulationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { scenario, target_user_id } = parsed.data;

  await connectDB();

  try {
    const result = await runSimulation(
      scenario,
      target_user_id,
      auth.userId
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('[Simulate API] Error:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Simulation failed'
    }, { status: 500 });
  }
});

/**
 * List recent simulation history.
 */
import { Simulation } from '@/models/Simulation';

export const GET = withRole(['admin', 'analyst'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');

  await connectDB();

  const history = await Simulation.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('target_user_id', 'name email role')
    .populate('triggered_by', 'name email')
    .lean();

  return NextResponse.json({ history });
});
