import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  baseline_profile: { type: Object, required: true },
  drift_index: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  risk_history: [{
    timestamp: { type: Date, default: Date.now },
    score: { type: Number }
  }],
  confidence_score: { type: Number, default: 100 }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
