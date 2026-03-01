import mongoose from 'mongoose';
import { connectDB } from './db';
import { User, IUser, BaselineProfile } from '@/models/User';
import { ActivityLog } from '@/models/ActivityLog';
import { RiskSnapshot, RiskFactor } from '@/models/RiskSnapshot';
import { Notification } from '@/models/Notification';

// ─────────────────────────────────────────────────────────────────────────────
// RISK ENGINE
//
// Computes a 0–100 risk score from 5 weighted behavioral factors.
// Each factor compares the user's recent activity to their baseline profile.
//
// Factors (weights must sum to 1.0):
//   1. login_anomaly        0.25  — off-hours, failed logins, new IPs
//   2. privilege_escalation 0.25  — unauthorized access attempts
//   3. file_access_anomaly  0.20  — file access volume spike
//   4. data_volume_anomaly  0.15  — download/upload spike
//   5. tone_shift           0.15  — communication sentiment degradation
//
// Drift Index = euclidean distance between current behavior vector & baseline
// Confidence  = 100 - (missing_signal_count × 10) — minimum 10
// ─────────────────────────────────────────────────────────────────────────────

const FACTOR_WEIGHTS = {
    login_anomaly: 0.25,
    privilege_escalation: 0.25,
    file_access_anomaly: 0.20,
    data_volume_anomaly: 0.15,
    tone_shift: 0.15,
} as const;

const RISK_THRESHOLDS = {
    warning: 60,
    critical: 80,
} as const;

// ─── Factor calculation helpers ───────────────────────────────────────────────

/**
 * Measures how anomalous the login pattern is vs the user's baseline.
 * Considers: off-hours activity, failed logins, unknown IPs.
 * Returns a 0–100 anomaly score.
 */
function computeLoginAnomaly(
    logs: Awaited<ReturnType<typeof ActivityLog.find>>,
    baseline: BaselineProfile
): number {
    if (!logs.length) return 0;

    const recentLogs = logs.slice(-20); // last 20 events
    let score = 0;

    for (const log of recentLogs) {
        const hour = log.login_time ? new Date(log.login_time).getHours() : -1;
        if (hour >= 0) {
            const hourDiff = Math.abs(hour - baseline.avg_login_hour);
            // Max off-hours penalty: 40 points (5+ hours off baseline)
            score += Math.min((hourDiff / 12) * 40, 40);
        }
        // Unknown IP penalty
        if (log.ip_address && !baseline.typical_ips.includes(log.ip_address)) {
            score += 10;
        }
    }

    // Normalize to 0–100
    return Math.min(score / recentLogs.length, 100);
}

/**
 * Detects privilege escalation attempts — events tagged as 'Privilege Escalation'.
 */
function computePrivilegeEscalation(
    logs: Awaited<ReturnType<typeof ActivityLog.find>>
): number {
    const escalationEvents = logs.filter(
        (l) => l.event_type === 'Privilege Escalation Attempt' || l.privilege_usage === 'elevated'
    );
    if (!escalationEvents.length) return 0;
    // Each escalation event drives score up sharply
    return Math.min(escalationEvents.length * 25, 100);
}

/**
 * Compares recent file access count vs the user's daily average baseline.
 */
function computeFileAccessAnomaly(
    logs: Awaited<ReturnType<typeof ActivityLog.find>>,
    baseline: BaselineProfile
): number {
    if (!baseline.avg_file_access_per_day || baseline.avg_file_access_per_day === 0) return 0;
    const totalAccess = logs.reduce((sum, l) => sum + (l.file_access_count || 0), 0);
    const avgPerEvent = totalAccess / Math.max(logs.length, 1);
    const ratio = avgPerEvent / baseline.avg_file_access_per_day;
    // Ratio > 5x baseline → 100, linear between 1x–5x
    return Math.min(Math.max(((ratio - 1) / 4) * 100, 0), 100);
}

/**
 * Compares data volume transferred vs historical average.
 */
function computeDataVolumeAnomaly(
    logs: Awaited<ReturnType<typeof ActivityLog.find>>
): number {
    const highVolumeEvents = logs.filter((l) => l.data_volume_mb > 100);
    if (!highVolumeEvents.length) return 0;
    const maxVolume = Math.max(...highVolumeEvents.map((l) => l.data_volume_mb));
    // 100MB → 10, 1000MB → 100
    return Math.min((maxVolume / 1000) * 100, 100);
}

/**
 * Measures communication sentiment degradation vs baseline.
 * communication_score 100 = very positive, 0 = very negative.
 */
function computeToneShift(
    logs: Awaited<ReturnType<typeof ActivityLog.find>>,
    baseline: BaselineProfile
): number {
    const commLogs = logs.filter((l) => l.communication_score !== null && l.communication_score !== undefined);
    if (!commLogs.length) return 0;
    const avgScore = commLogs.reduce((s, l) => s + (l.communication_score ?? 70), 0) / commLogs.length;
    const delta = baseline.avg_communication_score - avgScore;
    // Drop of 30+ points from baseline → 100 score
    return Math.min(Math.max((delta / 30) * 100, 0), 100);
}

/**
 * Euclidean distance between behavior vector and baseline, normalized to [0, 1].
 */
function computeDriftIndex(factors: RiskFactor[]): number {
    const sumSquares = factors.reduce((s, f) => s + Math.pow(f.raw_value / 100, 2), 0);
    return Math.min(Math.sqrt(sumSquares / factors.length), 1);
}

// ─── Main exported function ───────────────────────────────────────────────────

export interface RiskEngineResult {
    score: number;
    drift_index: number;
    confidence: number;
    factors: RiskFactor[];
}

/**
 * Computes a full risk score for a user, persists a RiskSnapshot,
 * updates the User document, and fires a notification if a threshold is crossed.
 *
 * @param userId - MongoDB ObjectId string of the target user
 * @param trigger - Description of what triggered this calculation
 * @param simulationId - Optional simulation ID if triggered by simulation engine
 */
export async function computeRisk(
    userId: string,
    trigger: string = 'manual',
    simulationId?: string
): Promise<RiskEngineResult> {
    await connectDB();

    const user = await User.findById(userId).select('+password_hash').lean<IUser>();
    if (!user) throw new Error(`User ${userId} not found`);

    const baseline = user.baseline_profile;

    // Fetch last 30 activity logs for this user
    const logs = await ActivityLog.find({ user_id: userId })
        .sort({ timestamp: -1 })
        .limit(30)
        .lean();

    // ── Compute each factor ──
    const loginRaw = computeLoginAnomaly(logs, baseline);
    const privilegeRaw = computePrivilegeEscalation(logs);
    const fileRaw = computeFileAccessAnomaly(logs, baseline);
    const dataRaw = computeDataVolumeAnomaly(logs);
    const toneRaw = computeToneShift(logs, baseline);

    const factors: RiskFactor[] = [
        {
            name: 'login_anomaly',
            label: 'Login Anomaly',
            weight: FACTOR_WEIGHTS.login_anomaly,
            raw_value: Math.round(loginRaw),
            contribution: Math.round(loginRaw * FACTOR_WEIGHTS.login_anomaly),
        },
        {
            name: 'privilege_escalation',
            label: 'Privilege Escalation',
            weight: FACTOR_WEIGHTS.privilege_escalation,
            raw_value: Math.round(privilegeRaw),
            contribution: Math.round(privilegeRaw * FACTOR_WEIGHTS.privilege_escalation),
        },
        {
            name: 'file_access_anomaly',
            label: 'File Access Anomaly',
            weight: FACTOR_WEIGHTS.file_access_anomaly,
            raw_value: Math.round(fileRaw),
            contribution: Math.round(fileRaw * FACTOR_WEIGHTS.file_access_anomaly),
        },
        {
            name: 'data_volume_anomaly',
            label: 'Data Volume Anomaly',
            weight: FACTOR_WEIGHTS.data_volume_anomaly,
            raw_value: Math.round(dataRaw),
            contribution: Math.round(dataRaw * FACTOR_WEIGHTS.data_volume_anomaly),
        },
        {
            name: 'tone_shift',
            label: 'Communication Tone',
            weight: FACTOR_WEIGHTS.tone_shift,
            raw_value: Math.round(toneRaw),
            contribution: Math.round(toneRaw * FACTOR_WEIGHTS.tone_shift),
        },
    ];

    // Final score = weighted sum
    const score = Math.min(
        Math.round(factors.reduce((s, f) => s + f.contribution, 0)),
        100
    );

    const drift_index = computeDriftIndex(factors);

    // Confidence degrades when signal data is missing
    const missingSignals = [loginRaw, fileRaw, dataRaw, toneRaw].filter((v) => v === 0).length;
    const confidence = Math.max(100 - missingSignals * 12, 10);

    const result: RiskEngineResult = { score, drift_index, confidence, factors };

    // ── Persist snapshot ──
    await RiskSnapshot.create({
        user_id: userId,
        score,
        drift_index,
        confidence,
        factors,
        trigger,
        simulation_id: simulationId ? new mongoose.Types.ObjectId(simulationId) : null,
        timestamp: new Date(),
    });

    // ── Update user document ──
    const prevScore = user.risk_score;
    await User.findByIdAndUpdate(userId, {
        risk_score: score,
        drift_index,
        confidence_score: confidence,
    });

    // ── Fire notification if threshold crossed ──
    const crossedCritical = score >= RISK_THRESHOLDS.critical && prevScore < RISK_THRESHOLDS.critical;
    const crossedWarning = score >= RISK_THRESHOLDS.warning && prevScore < RISK_THRESHOLDS.warning;

    if (crossedCritical || crossedWarning) {
        const severity = crossedCritical ? 'critical' : 'warning';
        await Notification.create({
            recipient_id: userId,
            title: crossedCritical ? '🚨 Critical Risk Level Reached' : '⚠️ Risk Level Elevated',
            message: `${user.name}'s risk score reached ${score}/100. Trigger: ${trigger}.`,
            severity,
            context_type: 'user',
            context_id: user._id,
            link: `/users/${userId}`,
        });
    }

    return result;
}
