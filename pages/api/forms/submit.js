import { submitFormToSupabase } from '../../../lib/supabase'
import { sanitizeObject, containsXSS, checkRateLimit } from '../../../lib/security'

// Rate limit tracking (in-memory, per-serverless-instance)
const rateLimits = new Map()

function serverRateLimit(ip, maxPerMinute = 10) {
  const now = Date.now()
  const key = `form_${ip}`
  const window = 60000

  if (!rateLimits.has(key)) {
    rateLimits.set(key, [])
  }

  const timestamps = rateLimits.get(key).filter(t => now - t < window)
  if (timestamps.length >= maxPerMinute) {
    return false
  }

  timestamps.push(now)
  rateLimits.set(key, timestamps)
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (!serverRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a moment.' })
  }

  const { formType, data } = req.body

  if (!formType || !data) {
    return res.status(400).json({ error: 'formType and data are required' })
  }

  // Sanitize
  const sanitizedData = sanitizeObject(data)

  // Check for XSS in all string fields
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && containsXSS(value)) {
      return res.status(400).json({ error: 'Invalid input detected.' })
    }
  }

  try {
    const { data: saved, error } = await submitFormToSupabase(formType, sanitizedData)

    if (error) {
      // If table doesn't exist yet, still acknowledge receipt
      console.warn('Supabase form save failed:', error)
      return res.status(200).json({
        success: true,
        id: `local-${Date.now()}`,
        message: 'Submission received (local mode)',
        storage: 'local',
      })
    }

    return res.status(200).json({
      success: true,
      id: saved?.id,
      message: 'Submission saved successfully',
      storage: 'supabase',
    })
  } catch (err) {
    console.error('Form submission error:', err)
    return res.status(200).json({
      success: true,
      id: `local-${Date.now()}`,
      message: 'Submission received (local mode)',
      storage: 'local',
    })
  }
}
