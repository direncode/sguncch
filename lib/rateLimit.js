// ============================================
// SERVER-SIDE RATE LIMITING
// In-memory rate limiter for API routes
// ============================================

// Store for rate limit tracking
// In production with multiple instances, use Redis instead
const rateLimitStore = new Map()

// Clean up old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, data] of rateLimitStore.entries()) {
      if (now - data.windowStart > data.windowMs * 2) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Get client IP from request (exported for use in other modules)
 */
export function getClientIP(req) {
  // Safety check for undefined req or headers
  if (!req || !req.headers) {
    console.warn('[getClientIP] Request or headers undefined')
    return 'unknown'
  }

  // Try to get real IP from various headers (for proxied requests)
  const forwarded = req.headers['x-forwarded-for']
  const realIp = req.headers['x-real-ip']

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to socket address
  return req.socket?.remoteAddress || 'unknown'
}

// Alias for backward compatibility
const getClientId = getClientIP

/**
 * Simple rate limiter factory for standalone use
 * Returns a function that can be called with clientIP
 */
export function createRateLimiter(options = {}) {
  const { windowMs = 60000, maxAttempts = 100 } = options
  const store = new Map()

  return function check(clientIP) {
    const now = Date.now()
    const key = clientIP || 'unknown'
    let entry = store.get(key)

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { windowStart: now, count: 0 }
    }

    entry.count++
    store.set(key, entry)

    const resetIn = entry.windowStart + windowMs - now

    if (entry.count > maxAttempts) {
      return { allowed: false, resetIn }
    }

    return { allowed: true, resetIn }
  }
}

/**
 * Rate limiter configuration
 */
export const rateLimitConfigs = {
  // Standard API rate limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  // Stricter limit for authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
  // Form submission limit
  form: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 submissions per minute
  },
  // Feedback submission limit
  feedback: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 feedback submissions per hour
  },
}

/**
 * Rate limit middleware for API routes
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} type - Rate limit type (api, auth, form, feedback)
 * @returns {Object} { success: boolean, remaining: number, resetIn: number }
 */
export function rateLimit(req, res, type = 'api') {
  const config = rateLimitConfigs[type] || rateLimitConfigs.api
  const { windowMs, max } = config

  const clientId = getClientId(req)
  const key = `${type}:${clientId}`
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    entry = {
      windowStart: now,
      windowMs,
      count: 0,
    }
  }

  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, max - entry.count)
  const resetIn = Math.ceil((entry.windowStart + windowMs - now) / 1000)

  // Set rate limit headers
  if (res) {
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil((entry.windowStart + windowMs) / 1000))
  }

  if (entry.count > max) {
    return {
      success: false,
      remaining: 0,
      resetIn,
      message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
    }
  }

  return {
    success: true,
    remaining,
    resetIn,
  }
}

/**
 * Rate limit middleware wrapper for Next.js API routes
 */
export function withRateLimit(handler, type = 'api') {
  return async (req, res) => {
    const result = rateLimit(req, res, type)

    if (!result.success) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: result.message,
        retryAfter: result.resetIn,
      })
    }

    return handler(req, res)
  }
}

/**
 * API route helper that includes common security checks
 */
export function secureApiHandler(handler, options = {}) {
  const {
    methods = ['GET', 'POST'],
    rateLimit: rateLimitType = 'api',
    requireAuth = false,
  } = options

  return async (req, res) => {
    // Check HTTP method
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '))
      return res.status(405).json({
        error: 'Method Not Allowed',
        allowed: methods,
      })
    }

    // Apply rate limiting
    const rateLimitResult = rateLimit(req, res, rateLimitType)
    if (!rateLimitResult.success) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: rateLimitResult.message,
        retryAfter: rateLimitResult.resetIn,
      })
    }

    // Note: Authentication check would go here if needed
    // For this frontend-focused app, auth is handled client-side

    try {
      return await handler(req, res)
    } catch (error) {
      console.error('API error:', error)
      return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
      })
    }
  }
}
