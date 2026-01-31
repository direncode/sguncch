import { secureApiHandler } from '../../lib/rateLimit'

function handler(req, res) {
  // Check which services are configured (server-side env vars)
  const groqConfigured = !!(
    process.env.GROQ_API_KEY &&
    !process.env.GROQ_API_KEY.includes('your-')
  )

  const adminConfigured = !!(
    process.env.ADMIN_KEY &&
    !process.env.ADMIN_KEY.includes('change-this')
  )

  res.status(200).json({
    status: 'healthy',
    service: 'project-bold',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    groqConfigured,
    adminConfigured,
  })
}

// Secure handler: only allows GET requests, includes rate limiting
export default secureApiHandler(handler, {
  methods: ['GET'],
  rateLimit: 'api',
})
