import mongoose, { Document, Model } from 'mongoose';

export type NotificationSeverity = 'info' | 'warning' | 'critical';
export type NotificationContextType = 'user' | 'simulation' | 'system' | 'risk';

export interface INotification extends Document {
  // The user who should see this notification (can be system-wide with null = admin)
  recipient_id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  // Navigation context — clicking the notification routes to this
  context_type: NotificationContextType;
  context_id: mongoose.Types.ObjectId | null;
  link: string;  // frontend route e.g. '/users/abc123'
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    read: { type: Boolean, default: false },
    context_type: {
      type: String,
      enum: ['user', 'simulation', 'system', 'risk'],
      default: 'system',
    },
    context_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    link: { type: String, default: '/dashboard' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
NotificationSchema.index({ recipient_id: 1, read: 1, createdAt: -1 });
// TTL: delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
