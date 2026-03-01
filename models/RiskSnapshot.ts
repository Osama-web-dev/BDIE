import mongoose, { Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// A single factor in the risk calculation — stored for explainability
// ─────────────────────────────────────────────────────────────────────────────
export interface RiskFactor {
    name: string;         // e.g. 'login_anomaly'
    label: string;        // human readable e.g. 'Off-hours Login'
    weight: number;       // 0–1, weights sum to 1.0
    raw_value: number;    // 0–100 computed signal
    contribution: number; // raw_value * weight * 100 → points added to final score
}

export interface IRiskSnapshot extends Document {
    user_id: mongoose.Types.ObjectId;
    score: number;           // final 0–100 risk score
    drift_index: number;     // 0–1 behavioral distance from baseline
    confidence: number;      // 0–100 confidence in the score
    factors: RiskFactor[];   // explainability breakdown
    trigger: string;         // what triggered this calculation
    simulation_id: mongoose.Types.ObjectId | null;  // linked if from a simulation
    timestamp: Date;
}

const RiskFactorSchema = new mongoose.Schema<RiskFactor>(
    {
        name: { type: String, required: true },
        label: { type: String, required: true },
        weight: { type: Number, required: true },
        raw_value: { type: Number, required: true },
        contribution: { type: Number, required: true },
    },
    { _id: false }
);

const RiskSnapshotSchema = new mongoose.Schema<IRiskSnapshot>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        score: { type: Number, required: true, min: 0, max: 100 },
        drift_index: { type: Number, required: true, min: 0, max: 1 },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        factors: { type: [RiskFactorSchema], default: [] },
        trigger: { type: String, default: 'manual' },
        simulation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Simulation',
            default: null,
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
RiskSnapshotSchema.index({ user_id: 1, timestamp: -1 });
// TTL: keep 1 year of risk history
RiskSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 3600 });

export const RiskSnapshot: Model<IRiskSnapshot> =
    mongoose.models.RiskSnapshot ||
    mongoose.model<IRiskSnapshot>('RiskSnapshot', RiskSnapshotSchema);
