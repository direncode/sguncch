import { secureApiHandler } from '../../lib/rateLimit'
import { validateFormData, sanitizeObject, schemas } from '../../lib/security'

async function handler(req, res) {
  // Only handle POST for submissions
  if (req.method === 'POST') {
    const { message, email, category } = req.body

    // Validate input
    const validation = validateFormData(req.body, schemas.feedback)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    // Sanitize data
    const sanitizedData = sanitizeObject(validation.data)

    // Here you would typically save to database
    // For now, we'll just acknowledge receipt
    // The actual persistence is handled client-side via store.js

    return res.status(200).json({
      success: true,
      message: 'Feedback received successfully',
      data: {
        id: Date.now(),
        receivedAt: new Date().toISOString(),
        category: sanitizedData.category,
      },
    })
  }

  // Handle GET to check status
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      message: 'Feedback API is operational',
    })
  }
}

// Secure handler with stricter rate limiting for feedback
export default secureApiHandler(handler, {
  methods: ['GET', 'POST'],
  rateLimit: 'feedback', // 5 submissions per hour
})
