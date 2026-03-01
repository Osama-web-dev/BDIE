import { connectDB } from './db';
import { RiskSnapshot, RiskFactor } from '@/models/RiskSnapshot';

// ─────────────────────────────────────────────────────────────────────────────
// AI EXPLAINABILITY LAYER
//
// Takes the most recent RiskSnapshot for a user and produces a human-readable
// explanation of what drove the risk score. Compares to the previous snapshot
// to highlight what changed.
// ─────────────────────────────────────────────────────────────────────────────

export interface FactorExplanation {
    name: string;
    label: string;
    weight: number;
    raw_value: number;
    contribution: number;
    percentage_of_total: number;  // contribution as % of total score
    trend: 'up' | 'down' | 'stable';
    trend_delta: number;   // change in raw_value vs previous snapshot
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;  // human-readable explanation sentence
}

export interface ExplainabilityReport {
    user_id: string;
    current_score: number;
    previous_score: number | null;
    score_delta: number;
    drift_index: number;
    confidence: number;
    factors: FactorExplanation[];
    summary: string;  // one-paragraph summary
    generated_at: string;
    snapshot_id: string;
    previous_snapshot_id: string | null;
}

const FACTOR_DESCRIPTIONS: Record<string, (value: number, delta: number) => string> = {
    login_anomaly: (v, d) =>
        v > 70
            ? `Severe login irregularities detected: off-hours access and ${Math.abs(d) > 0 ? `a ${d > 0 ? '+' : ''}${d}pt shift — ` : ''}logins from unknown IP addresses.`
            : v > 40
                ? 'Moderate login anomalies: some off-hours or unusual-location activity.'
                : 'Login patterns are within normal parameters.',

    privilege_escalation: (v, d) =>
        v > 70
            ? `Critical privilege abuse: multiple unauthorized access attempts to restricted endpoints.${d > 0 ? ` Increased by ${d}pts.` : ''}`
            : v > 20
                ? 'Elevated privilege usage detected — some attempts to access higher-privilege resources.'
                : 'No significant privilege escalation detected.',

    file_access_anomaly: (v, d) =>
        v > 70
            ? `Massive file access spike — volume is far beyond the user's daily baseline.${d > 0 ? ` Worsened by ${d}pts.` : ''}`
            : v > 40
                ? 'File access volume is moderately elevated compared to historical average.'
                : 'File access activity is normal.',

    data_volume_anomaly: (v, d) =>
        v > 70
            ? `Extremely high data transfer volume — possible exfiltration in progress.${d > 0 ? ` Increased by ${d}pts.` : ''}`
            : v > 40
                ? 'Elevated data transfer volume, above typical thresholds.'
                : 'Data transfer volumes are within normal range.',

    tone_shift: (v, d) =>
        v > 70
            ? `Severe communication sentiment degradation detected — very negative tone shift from baseline.${d > 0 ? ` Worsened by ${d}pts.` : ''}`
            : v > 40
                ? 'Moderate negative shift in communication tone compared to established baseline.'
                : 'Communication sentiment is stable and consistent with the baseline.',
};

function getSeverity(value: number): 'low' | 'medium' | 'high' | 'critical' {
    if (value >= 80) return 'critical';
    if (value >= 60) return 'high';
    if (value >= 30) return 'medium';
    return 'low';
}

function generateSummary(
    score: number,
    factors: FactorExplanation[],
    delta: number
): string {
    const topFactor = [...factors].sort((a, b) => b.contribution - a.contribution)[0];
    const trend = delta > 5 ? 'rising' : delta < -5 ? 'declining' : 'stable';

    if (score >= 80) {
        return `CRITICAL: This user presents an extreme behavioral risk profile (score: ${score}/100). The primary driver is "${topFactor.label}" contributing ${topFactor.contribution} points. Risk is ${trend}. Immediate review is recommended.`;
    } else if (score >= 60) {
        return `WARNING: Elevated behavioral risk detected (score: ${score}/100). The dominant factor is "${topFactor.label}" (${topFactor.percentage_of_total.toFixed(0)}% of total score). Risk trend is ${trend}. Monitor closely.`;
    } else if (score >= 30) {
        return `MODERATE: Low-level behavioral anomalies detected (score: ${score}/100). "${topFactor.label}" is the leading signal. Continued monitoring is advised.`;
    } else {
        return `NORMAL: The user's behavioral profile shows minimal deviation from their baseline (score: ${score}/100). No immediate action required.`;
    }
}

/**
 * Generates a full explainability report for a user's latest risk snapshot.
 */
export async function explainRisk(userId: string): Promise<ExplainabilityReport> {
    await connectDB();

    // Get the two most recent snapshots for delta computation
    const snapshots = await RiskSnapshot.find({ user_id: userId })
        .sort({ timestamp: -1 })
        .limit(2)
        .lean();

    if (!snapshots.length) {
        throw new Error('No risk snapshots found for this user');
    }

    const current = snapshots[0];
    const previous = snapshots[1] || null;

    // Build a lookup map for previous factor values
    const prevFactorMap: Record<string, number> = {};
    if (previous?.factors) {
        for (const f of previous.factors as RiskFactor[]) {
            prevFactorMap[f.name] = f.raw_value;
        }
    }

    const totalScore = current.score || 1; // avoid divide by zero

    const factors: FactorExplanation[] = (current.factors as RiskFactor[]).map((f) => {
        const prevValue = prevFactorMap[f.name] ?? f.raw_value;
        const delta = f.raw_value - prevValue;
        const descFn = FACTOR_DESCRIPTIONS[f.name];

        return {
            name: f.name,
            label: f.label,
            weight: f.weight,
            raw_value: f.raw_value,
            contribution: f.contribution,
            percentage_of_total: Math.round((f.contribution / totalScore) * 100),
            trend: delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable',
            trend_delta: delta,
            severity: getSeverity(f.raw_value),
            description: descFn ? descFn(f.raw_value, delta) : `${f.label} signal at ${f.raw_value}/100.`,
        };
    });

    const scoreDelta = previous ? current.score - previous.score : 0;

    return {
        user_id: userId,
        current_score: current.score,
        previous_score: previous?.score ?? null,
        score_delta: scoreDelta,
        drift_index: current.drift_index,
        confidence: current.confidence,
        factors,
        summary: generateSummary(current.score, factors, scoreDelta),
        generated_at: new Date().toISOString(),
        snapshot_id: current._id.toString(),
        previous_snapshot_id: previous?._id?.toString() ?? null,
    };
}
