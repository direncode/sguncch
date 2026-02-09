import { secureApiHandler } from '../../lib/rateLimit'

function handler(req, res) {
  // Production: return minimal info only. Don't leak env/config state.
  res.status(200).json({
    status: 'healthy',
    service: 'project-bold',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
}

export default secureApiHandler(handler, {
  methods: ['GET'],
  rateLimit: 'api',
})
