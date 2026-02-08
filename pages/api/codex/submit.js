// Public submission endpoint — no admin auth, rate limited
// Anyone can submit text for review (pending approval)

const rateLimitMap = new Map()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60000

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a moment.' })
  }

  try {
    const { title, text_content, submitter_name } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!text_content || !text_content.trim()) {
      return res.status(400).json({ error: 'Text content is required' })
    }
    if (text_content.length > 500000) {
      return res.status(400).json({ error: 'Text too long (max 500K characters)' })
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title too long (max 200 characters)' })
    }

    const { createDocument, logApprovalAction } = require('../../../lib/codex')

    const { data, error } = await createDocument({
      title: title.trim(),
      version: '1.0',
      source_url: null,
      text_full: text_content.trim(),
      file_name: null,
      file_size: Buffer.byteLength(text_content),
    })

    if (error) {
      return res.status(400).json({ error })
    }

    await logApprovalAction(data.id, 'submitted', submitter_name?.trim() || 'anonymous')

    return res.status(200).json({
      message: 'Submitted for review. An admin will approve or reject your contribution.',
      document_id: data.id,
    })
  } catch (err) {
    console.error('Public submit error:', err)
    return res.status(500).json({ error: 'Submission failed. Please try again.' })
  }
}
