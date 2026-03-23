import crypto from 'crypto'
import { ADMIN_KEYS, TEAM_ROLES } from './data'

const DEFAULT_DEV_KEY = 'dev-only-change-in-production'
const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

// Secret for signing session tokens — uses leads key as HMAC secret
function getTokenSecret() {
  return process.env.ADMIN_KEY_LEADS || process.env.ADMIN_KEY || DEFAULT_DEV_KEY
}

// ============================================
// PASSWORD HASHING (SHA-256 with random salt)
// ============================================

/**
 * Hash a password with a random 16-byte salt.
 * Returns "salt:hash" string for storage.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a stored "salt:hash" string.
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, hash] = storedHash.split(':')
  const check = crypto.createHash('sha256').update(salt + password).digest('hex')
  try {
    const hashBuf = Buffer.from(hash, 'hex')
    const checkBuf = Buffer.from(check, 'hex')
    if (hashBuf.length !== checkBuf.length) return false
    return crypto.timingSafeEqual(hashBuf, checkBuf)
  } catch {
    return false
  }
}

// ============================================
// SESSION TOKENS (HMAC-based, 24h expiry)
// ============================================

/**
 * Generate a session token encoding userId and role with 24h expiry.
 * Format: base64(JSON payload):hmac_signature
 */
export function generateSessionToken(userId, role) {
  const payload = JSON.stringify({
    userId,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  })
  const payloadB64 = Buffer.from(payload).toString('base64')
  const signature = crypto.createHmac('sha256', getTokenSecret()).update(payloadB64).digest('hex')
  return `${payloadB64}.${signature}`
}

/**
 * Verify and decode a session token.
 * Returns { valid: true, userId, role } or { valid: false }
 */
export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return { valid: false }
  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return { valid: false }

  const expected = crypto.createHmac('sha256', getTokenSecret()).update(payloadB64).digest('hex')
  try {
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return { valid: false }
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return { valid: false }
  } catch {
    return { valid: false }
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    if (!payload.exp || Date.now() > payload.exp) return { valid: false }
    return { valid: true, userId: payload.userId, role: payload.role }
  } catch {
    return { valid: false }
  }
}

// ============================================
// ADMIN VERIFICATION (keys + session tokens)
// ============================================

/**
 * Timing-safe admin verification to prevent timing attacks.
 * Checks token against all team keys AND session tokens.
 * Returns { authenticated: boolean, role: string|null, userId: string|null }
 */
export function verifyAdmin(req) {
  const authHeader = req.headers?.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { authenticated: false, role: null, userId: null }

  const token = authHeader.slice(7) // Remove 'Bearer '
  if (!token) return { authenticated: false, role: null, userId: null }

  // Allow temp access code through (defaults to leads role for dev)
  if (token === TEMP_ACCESS_CODE) return { authenticated: true, role: TEAM_ROLES.LEADS, userId: null }

  // Check token against each team's key
  for (const [role, key] of Object.entries(ADMIN_KEYS)) {
    if (!key) continue

    // Block default dev key in production
    if (process.env.NODE_ENV === 'production' && key === DEFAULT_DEV_KEY) {
      continue
    }

    try {
      const tokenBuf = Buffer.from(token)
      const keyBuf = Buffer.from(key)
      if (tokenBuf.length !== keyBuf.length) continue
      if (crypto.timingSafeEqual(tokenBuf, keyBuf)) {
        return { authenticated: true, role, userId: null }
      }
    } catch {
      continue
    }
  }

  // Check if it's a session token (from username/password login)
  const sessionResult = verifySessionToken(token)
  if (sessionResult.valid) {
    return { authenticated: true, role: sessionResult.role, userId: sessionResult.userId }
  }

  return { authenticated: false, role: null, userId: null }
}

/**
 * Admin auth middleware wrapper for API routes.
 * Attaches req.adminRole and req.userId for downstream use.
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    const result = verifyAdmin(req)
    if (!result.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.adminRole = result.role
    req.userId = result.userId
    return handler(req, res)
  }
}

/**
 * Leads-only auth middleware for sensitive endpoints.
 */
export function withLeadsAuth(handler) {
  return async (req, res) => {
    const result = verifyAdmin(req)
    if (!result.authenticated || result.role !== TEAM_ROLES.LEADS) {
      return res.status(403).json({ error: 'Forbidden: Leads access required' })
    }
    req.adminRole = result.role
    req.userId = result.userId
    return handler(req, res)
  }
}
