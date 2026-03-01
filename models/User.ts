import mongoose, { Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-document: behavioral baseline used by the risk engine for comparison
// ─────────────────────────────────────────────────────────────────────────────
export interface BaselineProfile {
  avg_login_hour: number;           // typical login hour (0–23)
  avg_session_duration: number;     // minutes
  avg_file_access_per_day: number;  // file operations per day
  avg_communication_score: number;  // sentiment baseline 0–100 (100 = most positive)
  typical_ips: string[];            // known IP addresses
}

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  // Risk fields — updated by the risk engine
  risk_score: number;      // 0–100
  drift_index: number;     // 0–1 (cosine distance from baseline)
  confidence_score: number; // 0–100 (data completeness)
  // Behavioral baseline established at user creation
  baseline_profile: BaselineProfile;
  // Auth security fields
  refresh_token_hashes: string[];  // stored as bcrypt hashes, max 5 devices
  last_login: Date | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BaselineProfileSchema = new mongoose.Schema<BaselineProfile>(
  {
    avg_login_hour: { type: Number, default: 9 },
    avg_session_duration: { type: Number, default: 480 },
    avg_file_access_per_day: { type: Number, default: 20 },
    avg_communication_score: { type: Number, default: 70 },
    typical_ips: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password_hash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'analyst', 'viewer'],
      default: 'viewer',
    },
    department: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    risk_score: { type: Number, default: 0, min: 0, max: 100 },
    drift_index: { type: Number, default: 0, min: 0, max: 1 },
    confidence_score: { type: Number, default: 100, min: 0, max: 100 },
    baseline_profile: { type: BaselineProfileSchema, default: () => ({}) },
    refresh_token_hashes: { type: [String], default: [], select: false },
    last_login: { type: Date, default: null },
    failed_login_attempts: { type: Number, default: 0 },
    locked_until: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ department: 1 });
UserSchema.index({ risk_score: -1 });  // used by dashboard to get top-risk users
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
