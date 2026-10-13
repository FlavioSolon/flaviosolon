import crypto from 'node:crypto';

// Secret key for HMAC signing (fallback to a generated static machine key)
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'flavio-solon-zenite-secret-key-2026-amazonas-ultra-secure';
const COOKIE_NAME = 'fs_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Master admin password (overrideable via environment variable)
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FlavioAmazonas#2026!';

// Brute-force rate limiting store: ip -> { attempts, lockedUntil }
const rateLimitMap = new Map<string, { attempts: number; lockedUntil: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: 5 };
  }

  if (record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  // If lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    rateLimitMap.delete(ip);
    return { allowed: true, remainingAttempts: 5 };
  }

  const remaining = Math.max(0, 5 - record.attempts);
  return { allowed: record.attempts < 5, remainingAttempts: remaining };
}

export function recordFailedAttempt(ip: string): { remainingAttempts: number; locked: boolean } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
    rateLimitMap.set(ip, record);
    return { remainingAttempts: 0, locked: true };
  }

  rateLimitMap.set(ip, record);
  return { remainingAttempts: 5 - record.attempts, locked: false };
}

export function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

export function verifyPassword(provided: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  
  // Timing-safe comparison to prevent timing attacks
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  
  if (bufA.length !== bufB.length) {
    // Constant time dummy comparison
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const payload = {
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [base64Payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  if (signature !== expectedSignature) return false;

  try {
    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return false;
    }
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export { COOKIE_NAME, SESSION_MAX_AGE };
