import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;  // bcrypt cost factor — ~300ms on modern hardware

// ─────────────────────────────────────────────────────────────────────────────
// Password hashing and comparison
// ─────────────────────────────────────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh token storage — we store only a bcrypt hash of the raw token in DB.
// This prevents token theft from DB compromise.
// ─────────────────────────────────────────────────────────────────────────────
export async function hashToken(token: string): Promise<string> {
    // Lower cost factor for tokens (they're long random strings, no dictionary attacks)
    return bcrypt.hash(token, 8);
}

export async function verifyTokenHash(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// Password validation rules (enforced at registration and password change)
// ─────────────────────────────────────────────────────────────────────────────
export function validatePasswordStrength(password: string): {
    valid: boolean;
    message: string;
} {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'OK' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanitize user object for API responses — strip sensitive fields
// ─────────────────────────────────────────────────────────────────────────────
export function sanitizeUser(user: Record<string, unknown>) {
    const { password_hash, refresh_token_hashes, failed_login_attempts, locked_until, __v, ...safe } = user;
    void password_hash; void refresh_token_hashes; void failed_login_attempts; void locked_until; void __v;
    return safe;
}
