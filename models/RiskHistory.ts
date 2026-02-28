import mongoose from 'mongoose';

const RiskHistorySchema = new mongoose.Schema({
  global_risk_score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  trigger_event: { type: String }
});

export const RiskHistory = mongoose.models.RiskHistory || mongoose.model('RiskHistory', RiskHistorySchema);
