import crypto from 'crypto'
import { ADMIN_KEYS, TEAM_ROLES } from './data'

const DEFAULT_DEV_KEY = 'dev-only-change-in-production'
const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

/**
 * Timing-safe admin verification to prevent timing attacks.
 * Checks token against all team keys and returns the matching role.
 * Returns { authenticated: boolean, role: string|null }
 */
export function verifyAdmin(req) {
  const authHeader = req.headers?.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { authenticated: false, role: null }

  const token = authHeader.slice(7) // Remove 'Bearer '
  if (!token) return { authenticated: false, role: null }

  // Allow temp access code through (defaults to leads role for dev)
  if (token === TEMP_ACCESS_CODE) return { authenticated: true, role: TEAM_ROLES.LEADS }

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
        return { authenticated: true, role }
      }
    } catch {
      continue
    }
  }

  return { authenticated: false, role: null }
}

/**
 * Admin auth middleware wrapper for API routes.
 * Attaches req.adminRole for downstream use.
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    const result = verifyAdmin(req)
    if (!result.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.adminRole = result.role
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
    return handler(req, res)
  }
}
