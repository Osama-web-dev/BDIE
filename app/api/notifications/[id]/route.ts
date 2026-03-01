import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { withAuth } from '@/middleware/withAuth';

/**
 * Handle individual notification actions.
 */
export const PATCH = withAuth(async (req, { params }) => {
  const { id } = await params;
  await connectDB();

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});

export const DELETE = withAuth(async (req, { params }) => {
  const { id } = await params;
  await connectDB();

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});
