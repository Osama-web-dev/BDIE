import mongoose, { Document, Model } from 'mongoose';

export type SimulationScenario =
    | 'privilege_escalation'
    | 'data_hoarding'
    | 'suspicious_logins'
    | 'tone_shift';

export type SimulationStatus = 'running' | 'complete' | 'failed';

export interface ISimulation extends Document {
    scenario: SimulationScenario;
    target_user_id: mongoose.Types.ObjectId;
    triggered_by: mongoose.Types.ObjectId;  // admin/analyst who ran it
    parameters: Record<string, unknown>;    // scenario-specific input params
    pre_score: number;    // risk score before simulation
    post_score: number;   // risk score after simulation
    risk_delta: number;   // post_score - pre_score
    pre_drift: number;    // drift index before
    post_drift: number;   // drift index after
    status: SimulationStatus;
    log: string[];        // step-by-step execution trace
    createdAt: Date;
    updatedAt: Date;
}

const SimulationSchema = new mongoose.Schema<ISimulation>(
    {
        scenario: {
            type: String,
            enum: ['privilege_escalation', 'data_hoarding', 'suspicious_logins', 'tone_shift'],
            required: true,
        },
        target_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        triggered_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
        pre_score: { type: Number, default: 0 },
        post_score: { type: Number, default: 0 },
        risk_delta: { type: Number, default: 0 },
        pre_drift: { type: Number, default: 0 },
        post_drift: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['running', 'complete', 'failed'],
            default: 'running',
        },
        log: { type: [String], default: [] },
    },
    { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
SimulationSchema.index({ triggered_by: 1, createdAt: -1 });
SimulationSchema.index({ target_user_id: 1, createdAt: -1 });
SimulationSchema.index({ scenario: 1 });

export const Simulation: Model<ISimulation> =
    mongoose.models.Simulation ||
    mongoose.model<ISimulation>('Simulation', SimulationSchema);
