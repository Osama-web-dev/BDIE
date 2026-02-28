import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event_type: { type: String, required: true },
  login_time: { type: Date },
  file_access: [{ type: String }],
  privilege_usage: { type: String },
  communication_score: { type: Number },
  anomaly_score: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
