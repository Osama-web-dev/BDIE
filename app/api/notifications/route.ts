import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { withAuth } from '@/middleware/withAuth';

/**
 * List the current user's notifications.
 */
export const GET = withAuth(async (req, ctx, auth) => {
  await connectDB();

  const notifications = await Notification.find({ recipient_id: auth.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipient_id: auth.userId,
    read: false
  });

  return NextResponse.json({
    notifications,
    unread_count: unreadCount,
  });
});

/**
 * Mark all as read helper.
 */
export const PATCH = withAuth(async (req, ctx, auth) => {
  await connectDB();

  await Notification.updateMany(
    { recipient_id: auth.userId, read: false },
    { read: true }
  );

  return NextResponse.json({ success: true });
});
