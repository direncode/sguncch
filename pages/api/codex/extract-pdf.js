import { withAdminAuth } from '../../../lib/auth'

function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.XAI_API_KEY
  if (!key || key === 'your-xai-api-key-here' || key === 'xai-placeholder-set-in-vercel') {
    return res.status(500).json({ error: 'XAI_API_KEY not configured on server' })
  }

  return res.status(200).json({ key })
}

export default withAdminAuth(handler)
