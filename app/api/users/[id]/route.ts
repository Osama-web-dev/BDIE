import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withRole } from '@/middleware/withRole';
import { sanitizeUser } from '@/lib/auth';

const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'analyst', 'viewer']).optional(),
  department: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

/**
 * Get, Update, or Deactivate individual User (Admin/Analyst Only)
 */
export const GET = withRole(['admin', 'analyst', 'viewer'], async (req, { params }) => {
  const { id } = await params;
  await connectDB();

  const user = await User.findById(id).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: sanitizeUser(user as any) });
});

export const PATCH = withRole(['admin'], async (req, { params }) => {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: sanitizeUser(user as any) });
});

export const DELETE = withRole(['admin'], async (req, { params }) => {
  const { id } = await params;
  await connectDB();

  const user = await User.findByIdAndUpdate(id, { status: 'inactive' }, { new: true }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'User deactivated successfully' });
});
