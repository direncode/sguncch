import { verifyAdmin } from '../../../lib/auth'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Strict rate limit on login: 5 attempts per 15 minutes
  const rl = rateLimit(req, res, 'auth')
  if (!rl.success) {
    return res.status(429).json({ error: rl.message })
  }

  // Validate the admin key server-side
  if (verifyAdmin(req)) {
    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ error: 'Invalid admin key' })
}
