import mongoose, { Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Immutable audit trail for all mutation actions in the system.
// Records who did what to whom, from where.
// ─────────────────────────────────────────────────────────────────────────────
export interface IAuditLog extends Document {
    actor_id: mongoose.Types.ObjectId;
    actor_name: string;
    actor_role: string;
    // e.g. 'user.create', 'user.deactivate', 'simulation.run', 'risk.recalculate'
    action: string;
    target_type: string;  // 'user', 'simulation', 'notification', 'system'
    target_id: mongoose.Types.ObjectId | null;
    // Sanitized snapshot of the request payload (no passwords, no tokens)
    payload: Record<string, unknown>;
    ip_address: string;
    user_agent: string;
    // HTTP result
    status_code: number;
    createdAt: Date;
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>(
    {
        actor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        actor_name: { type: String, required: true },
        actor_role: { type: String, required: true },
        action: { type: String, required: true, trim: true },
        target_type: { type: String, required: true },
        target_id: { type: mongoose.Schema.Types.ObjectId, default: null },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },
        ip_address: { type: String, default: '' },
        user_agent: { type: String, default: '' },
        status_code: { type: Number, default: 200 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
AuditLogSchema.index({ actor_id: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
// TTL: retain 90 days for compliance
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

export const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog ||
    mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
