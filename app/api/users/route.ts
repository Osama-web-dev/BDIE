import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withRole } from '@/middleware/withRole';
import { hashPassword, sanitizeUser } from '@/lib/auth';

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'analyst', 'viewer']),
  department: z.string().min(1).max(100),
});

/**
 * List or Create Users (Admin/Analyst Only)
 */
export const GET = withRole(['admin', 'analyst'], async (req: NextRequest) => {
  const url = new URL(req.url);
  const department = url.searchParams.get('department');
  const role = url.searchParams.get('role');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const skip = parseInt(url.searchParams.get('skip') || '0');

  await connectDB();

  const query: any = {};
  if (department) query.department = department;
  if (role) query.role = role;

  const users = await User.find(query)
    .sort({ risk_score: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  return NextResponse.json({
    users: users.map(u => sanitizeUser(u)),
    pagination: { total, limit, skip },
  });
});

export const POST = withRole(['admin'], async (req: NextRequest) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { name, email, password, role, department } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
  }

  const password_hash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password_hash,
    role,
    department,
    baseline_profile: {
      avg_login_hour: 9,
      avg_session_duration: 480,
      avg_file_access_per_day: 20,
      avg_communication_score: 70,
    }
  });

  return NextResponse.json({
    user: sanitizeUser(user.toObject()),
  }, { status: 201 });
});
