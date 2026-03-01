import mongoose from 'mongoose';
import { connectDB } from './db';
import { User } from '@/models/User';
import { ActivityLog } from '@/models/ActivityLog';
import { Simulation, SimulationScenario } from '@/models/Simulation';
import { Notification } from '@/models/Notification';
import { computeRisk } from './riskEngine';

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION ENGINE
//
// Each scenario generates a realistic batch of ActivityLog documents
// that represent the attack pattern, then triggers the risk engine
// to recompute the affected user's score.
//
// The simulation is stored as a Simulation document with a step-by-step
// log for audit and display purposes.
// ─────────────────────────────────────────────────────────────────────────────

export interface SimulationResult {
    simulation_id: string;
    scenario: SimulationScenario;
    pre_score: number;
    post_score: number;
    risk_delta: number;
    pre_drift: number;
    post_drift: number;
    log: string[];
    status: 'complete' | 'failed';
}

/**
 * Runs a simulation scenario against a target user.
 */
export async function runSimulation(
    scenario: SimulationScenario,
    targetUserId: string,
    triggeredBy: string
): Promise<SimulationResult> {
    await connectDB();

    const user = await User.findById(targetUserId).lean();
    if (!user) throw new Error(`Target user ${targetUserId} not found`);

    const simulationLog: string[] = [];
    const log = (msg: string) => {
        simulationLog.push(`[${new Date().toISOString()}] ${msg}`);
    };

    // Create initial simulation record in 'running' state
    const simulation = await Simulation.create({
        scenario,
        target_user_id: new mongoose.Types.ObjectId(targetUserId),
        triggered_by: new mongoose.Types.ObjectId(triggeredBy),
        parameters: { initiated_at: new Date().toISOString() },
        pre_score: user.risk_score,
        post_score: user.risk_score,
        risk_delta: 0,
        pre_drift: user.drift_index,
        post_drift: user.drift_index,
        status: 'running',
        log: [],
    });

    const simulationId = simulation._id.toString();
    log(`Simulation started: scenario=${scenario}, target=${user.name}`);
    log(`Pre-simulation risk score: ${user.risk_score}/100, drift: ${user.drift_index.toFixed(3)}`);

    try {
        // ── Generate scenario-specific activity logs ──
        const now = new Date();

        if (scenario === 'privilege_escalation') {
            log('Generating privilege escalation events...');
            // 8 escalation attempts over the last 2 hours
            for (let i = 0; i < 8; i++) {
                const ts = new Date(now.getTime() - i * 15 * 60 * 1000);
                await ActivityLog.create({
                    user_id: new mongoose.Types.ObjectId(targetUserId),
                    event_type: 'Privilege Escalation Attempt',
                    severity: 'critical',
                    login_time: ts,
                    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    user_agent: 'Mozilla/5.0 (simulated)',
                    privilege_usage: 'elevated',
                    file_access_count: 3,
                    files_accessed: ['/etc/shadow', '/var/secrets/credentials', '/admin/tokens'],
                    anomaly_score: 90,
                    timestamp: ts,
                    metadata: { simulation_id: simulationId, attempt_number: i + 1 },
                });
                log(`  → Escalation attempt ${i + 1}: accessing restricted endpoint at ${ts.toISOString()}`);
            }

            await Notification.create({
                recipient_id: new mongoose.Types.ObjectId(triggeredBy),
                title: '🔑 Privilege Escalation Detected',
                message: `${user.name} attempted to access 8 restricted admin endpoints over 2 hours.`,
                severity: 'critical',
                context_type: 'simulation',
                context_id: simulation._id,
                link: `/simulations`,
            });

        } else if (scenario === 'data_hoarding') {
            log('Generating data hoarding / exfiltration events...');
            const fileGroups = [
                ['Q4_Revenue_Final.xlsx', 'Payroll_All_2025.csv', 'Employee_SSN_DB.csv'],
                ['IP_Source_Code_v2.zip', 'Client_Contracts_2025.pdf', 'Strategic_Plan_Q1.docx'],
                ['AWS_Keys_Prod.txt', 'DB_Backup_Nov.sql.gz', 'Security_Audit_Internal.pdf'],
            ];
            for (let i = 0; i < 6; i++) {
                const ts = new Date(now.getTime() - i * 20 * 60 * 1000);
                const files = fileGroups[i % fileGroups.length];
                await ActivityLog.create({
                    user_id: new mongoose.Types.ObjectId(targetUserId),
                    event_type: 'Mass File Download',
                    severity: 'critical',
                    login_time: ts,
                    ip_address: user.baseline_profile.typical_ips[0] || '10.0.0.1',
                    user_agent: 'curl/7.88.1 (simulated)',
                    file_access_count: files.length,
                    files_accessed: files,
                    data_volume_mb: 8000 + Math.random() * 4000,
                    anomaly_score: 95,
                    timestamp: ts,
                    metadata: { simulation_id: simulationId, batch: i + 1 },
                });
                log(`  → Batch ${i + 1}: downloaded ${files.join(', ')} (${(8000 + Math.random() * 4000).toFixed(0)}MB)`);
            }

            await Notification.create({
                recipient_id: new mongoose.Types.ObjectId(triggeredBy),
                title: '💾 Critical Data Exfiltration Risk',
                message: `${user.name} downloaded 6 batches of sensitive documents totaling ~50GB.`,
                severity: 'critical',
                context_type: 'simulation',
                context_id: simulation._id,
                link: `/simulations`,
            });

        } else if (scenario === 'suspicious_logins') {
            log('Generating suspicious login cluster events...');
            const foreignIps = ['185.220.101.35', '91.108.4.200', '198.96.155.3', '46.151.209.33'];
            for (let i = 0; i < 12; i++) {
                const ts = new Date(now.getTime() - i * 5 * 60 * 1000);
                const isSuccess = i < 2; // first 2 succeed from unknown IPs, then blocked
                await ActivityLog.create({
                    user_id: new mongoose.Types.ObjectId(targetUserId),
                    event_type: isSuccess ? 'Suspicious Login Success' : 'Failed Login',
                    severity: isSuccess ? 'high' : 'medium',
                    login_time: ts,
                    ip_address: foreignIps[i % foreignIps.length],
                    user_agent: 'python-requests/2.31.0 (simulated)',
                    anomaly_score: isSuccess ? 70 : 45,
                    timestamp: ts,
                    geo_country: 'Unknown',
                    geo_city: 'Unknown',
                    metadata: { simulation_id: simulationId, attempt: i + 1, success: isSuccess },
                });
                log(`  → Login ${isSuccess ? 'SUCCESS' : 'FAILED'} from ${foreignIps[i % foreignIps.length]} (attempt ${i + 1})`);
            }

            await Notification.create({
                recipient_id: new mongoose.Types.ObjectId(triggeredBy),
                title: '🌐 Suspicious Login Cluster',
                message: `12 login attempts from 4 unknown foreign IPs for ${user.name}. 2 succeeded.`,
                severity: 'warning',
                context_type: 'simulation',
                context_id: simulation._id,
                link: `/simulations`,
            });

        } else if (scenario === 'tone_shift') {
            log('Generating communication tone shift events...');
            const sentimentScores = [38, 22, 41, 15, 30, 18, 25, 10];
            for (let i = 0; i < sentimentScores.length; i++) {
                const ts = new Date(now.getTime() - i * 60 * 60 * 1000);
                await ActivityLog.create({
                    user_id: new mongoose.Types.ObjectId(targetUserId),
                    event_type: 'Communication Tone Shift',
                    severity: sentimentScores[i] < 20 ? 'high' : 'medium',
                    login_time: ts,
                    ip_address: user.baseline_profile.typical_ips[0] || '10.0.0.1',
                    communication_score: sentimentScores[i],
                    anomaly_score: Math.round((70 - sentimentScores[i]) * 1.5),
                    timestamp: ts,
                    metadata: {
                        simulation_id: simulationId,
                        sentiment_label: sentimentScores[i] < 25 ? 'Very Negative' : 'Negative',
                    },
                });
                log(`  → Communication event ${i + 1}: sentiment=${sentimentScores[i]}/100 (baseline: ${user.baseline_profile.avg_communication_score})`);
            }

            await Notification.create({
                recipient_id: new mongoose.Types.ObjectId(triggeredBy),
                title: '💬 Behavioral Tone Anomaly',
                message: `${user.name}'s communication sentiment dropped from ${user.baseline_profile.avg_communication_score} to avg 25/100.`,
                severity: 'warning',
                context_type: 'simulation',
                context_id: simulation._id,
                link: `/simulations`,
            });
        }

        // ── Trigger real risk recalculation ──
        log('Triggering risk engine recalculation...');
        const riskResult = await computeRisk(
            targetUserId,
            `simulation:${scenario}`,
            simulationId
        );

        log(`Post-simulation risk score: ${riskResult.score}/100, drift: ${riskResult.drift_index.toFixed(3)}`);
        log(`Risk delta: +${riskResult.score - user.risk_score} points`);
        log('Simulation complete.');

        // ── Update simulation document ──
        await Simulation.findByIdAndUpdate(simulationId, {
            post_score: riskResult.score,
            risk_delta: riskResult.score - user.risk_score,
            post_drift: riskResult.drift_index,
            status: 'complete',
            log: simulationLog,
        });

        return {
            simulation_id: simulationId,
            scenario,
            pre_score: user.risk_score,
            post_score: riskResult.score,
            risk_delta: riskResult.score - user.risk_score,
            pre_drift: user.drift_index,
            post_drift: riskResult.drift_index,
            log: simulationLog,
            status: 'complete',
        };

    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        log(`ERROR: ${errorMsg}`);
        await Simulation.findByIdAndUpdate(simulationId, { status: 'failed', log: simulationLog });
        throw err;
    }
}
