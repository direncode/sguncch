import { secureApiHandler } from '../../lib/rateLimit'

function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'project-bold',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
}

// Secure handler: only allows GET requests, includes rate limiting
export default secureApiHandler(handler, {
  methods: ['GET'],
  rateLimit: 'api',
})
