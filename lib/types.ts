import mongoose from 'mongoose';

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type SimulationScenario = 'privilege_escalation' | 'data_hoarding' | 'suspicious_logins' | 'tone_shift' | 'none';
export type Severity = 'info' | 'warning' | 'critical' | 'low' | 'medium' | 'high';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
    risk_score: number;
    drift_index: number;
    confidence_score: number;
    last_login?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RiskFactor {
    name: string;
    label: string;
    weight: number;
    raw_value: number;
    contribution: number;
}

export interface RiskSnapshot {
    _id: string;
    user_id: string;
    score: number;
    drift_index: number;
    confidence: number;
    factors: RiskFactor[];
    trigger: string;
    timestamp: string;
}

export interface Notification {
    _id: string;
    recipient_id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    read: boolean;
    link: string;
    createdAt: string;
}

export interface Simulation {
    _id: string;
    scenario: SimulationScenario;
    target_user_id: any; // populated
    triggered_by: any;   // populated
    pre_score: number;
    post_score: number;
    risk_delta: number;
    status: 'running' | 'complete' | 'failed';
    log: string[];
    createdAt: string;
}

export interface AuditLog {
    _id: string;
    actor_name: string;
    actor_role: string;
    action: string;
    target_type: string;
    payload: any;
    ip_address: string;
    status_code: number;
    createdAt: string;
}
