import { connectDB } from './db';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { getClientIp } from '@/middleware/withAuth';
import { NextRequest } from 'next/server';

/**
 * Universal utility to record system-wide audit events.
 * 
 * @param actorId - ID of user performing the action
 * @param action - Action string (e.g. 'user.create')
 * @param targetType - Type of modified entity
 * @param targetId - ID of modified entity
 * @param payload - Request data snapshot (sanitized)
 * @param req - Original NextRequest (to extract IP and User Agent)
 */
export async function recordAudit(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string | null = null,
    payload: Record<string, any> = {},
    req: NextRequest,
    statusCode: number = 200
) {
    await connectDB();

    const actor = await User.findById(actorId).lean();
    if (!actor) return; // fail silent for audit recording to prevent blocking primary flow

    // Sanitize payload: strip passwords, keys, tokens
    const sanitizedPayload = { ...payload };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'refresh_token'];
    sensitiveKeys.forEach(k => delete sanitizedPayload[k]);

    await AuditLog.create({
        actor_id: actorId,
        actor_name: actor.name,
        actor_role: actor.role,
        action,
        target_type: targetType,
        target_id: targetId,
        payload: sanitizedPayload,
        ip_address: getClientIp(req),
        user_agent: req.headers.get('user-agent') || 'unknown',
        status_code: statusCode,
    });
}
