// ============================================
// BUDGET VALIDATION API
// Uses Grok (xAI) for real-world context checking
// ============================================

import { validateFundingRequest, quickPriceCheck } from '../../lib/groq'
import { createRateLimiter, getClientIP } from '../../lib/rateLimit'
import { createLogger } from '../../lib/logger'

const log = createLogger('API:validate-budget')

// Rate limit: 20 validation requests per minute per IP
const limiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxAttempts: 20,
})

export default async function handler(req, res) {
  log.info('Incoming request', { method: req.method, ip: getClientIP(req) })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control')
    return res.status(200).end()
  }

  // Only allow POST
  if (req.method !== 'POST') {
    log.info('Rejected request - only POST allowed', { method: req.method })
    return res.status(405).json({
      error: 'Method not allowed',
      method: req.method,
      message: `This endpoint only accepts POST requests. Received: ${req.method}`,
      hint: 'If you see this in browser console, it may be from browser prefetch - this is normal.'
    })
  }

  // Rate limiting
  const clientIP = getClientIP(req)
  const rateLimitResult = limiter(clientIP)

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
    })
  }

  try {
    const { request, deepValidation = false } = req.body

    if (!request || !request.amount || !request.description) {
      return res.status(400).json({
        error: 'Missing required fields: amount, description',
      })
    }

    // Quick price check (no API call)
    const quickCheck = quickPriceCheck(
      request.category || 'events',
      request.amount,
      request.description,
      request.studentsImpacted
    )

    // If deep validation requested or quick check flags issues
    if (deepValidation || quickCheck.requiresDeepValidation) {
      const aiValidation = await validateFundingRequest(request)

      return res.status(200).json({
        quickCheck,
        aiValidation,
        requiresReview: aiValidation.recommendation === 'FLAG' ||
                        aiValidation.recommendation === 'REVIEW' ||
                        quickCheck.severity !== 'normal',
      })
    }

    // Return quick check only
    return res.status(200).json({
      quickCheck,
      aiValidation: null,
      requiresReview: quickCheck.severity !== 'normal',
    })

  } catch (error) {
    log.error('Budget validation error', { error: error.message })
    return res.status(500).json({
      error: 'Validation failed',
      message: error.message,
    })
  }
}
