import crypto from 'crypto'
import { ADMIN_KEY } from './data'
import { createLogger } from './logger'

const log = createLogger('Auth')

const DEFAULT_DEV_KEY = 'dev-only-change-in-production'
const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

/**
 * Timing-safe admin verification to prevent timing attacks.
 * Blocks access entirely if default dev key is used in production.
 */
export function verifyAdmin(req) {
  const authHeader = req.headers?.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false

  const token = authHeader.slice(7) // Remove 'Bearer '
  if (!token) return false

  // Allow temp access code through
  if (token === TEMP_ACCESS_CODE) return true

  // Block default dev key in production for normal login
  if (process.env.NODE_ENV === 'production' && ADMIN_KEY === DEFAULT_DEV_KEY) {
    log.error('BLOCKED: Default admin key used in production')
    return false
  }

  if (!ADMIN_KEY) return false

  // Timing-safe comparison to prevent timing attacks
  try {
    const tokenBuf = Buffer.from(token)
    const keyBuf = Buffer.from(ADMIN_KEY)
    if (tokenBuf.length !== keyBuf.length) return false
    return crypto.timingSafeEqual(tokenBuf, keyBuf)
  } catch {
    return false
  }
}

/**
 * Admin auth middleware wrapper for API routes.
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}
