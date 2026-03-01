import mongoose, { Document, Model } from 'mongoose';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IActivityLog extends Document {
  user_id: mongoose.Types.ObjectId;
  event_type: string;
  severity: EventSeverity;
  // Login metadata
  login_time: Date | null;
  ip_address: string;
  user_agent: string;
  geo_country: string;
  geo_city: string;
  // Behavioral signals
  file_access_count: number;
  files_accessed: string[];
  privilege_usage: string;
  communication_score: number | null;  // 0–100 sentiment
  data_volume_mb: number;              // data transferred in MB
  // Anomaly signal — pre-computed before snapshot
  anomaly_score: number;  // 0–100
  // Arbitrary payload for scenario-specific data
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const ActivityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event_type: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    login_time: { type: Date, default: null },
    ip_address: { type: String, default: '' },
    user_agent: { type: String, default: '' },
    geo_country: { type: String, default: '' },
    geo_city: { type: String, default: '' },
    file_access_count: { type: Number, default: 0 },
    files_accessed: { type: [String], default: [] },
    privilege_usage: { type: String, default: 'standard' },
    communication_score: { type: Number, default: null },
    data_volume_mb: { type: Number, default: 0 },
    anomaly_score: { type: Number, default: 0, min: 0, max: 100 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }  // manual timestamp field above
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index for per-user time-series queries
ActivityLogSchema.index({ user_id: 1, timestamp: -1 });
ActivityLogSchema.index({ severity: 1, timestamp: -1 });
// TTL: auto-delete raw logs after 180 days
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
