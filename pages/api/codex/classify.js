// AI Document Classification — uses Grok to determine category, metadata, and ID
// Called by admin Scroll for intelligent document sorting

import { withAdminAuth } from '../../../lib/auth'
import { callGrok } from '../../../lib/embeddings'
import crypto from 'crypto'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { title, text_preview } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const preview = (text_preview || '').slice(0, 2000)
    const commitId = crypto.createHash('sha256')
      .update(`${title}:${preview}:${Date.now()}`)
      .digest('hex')
      .slice(0, 12)

    const messages = [
      {
        role: 'system',
        content: `You classify governance documents for UNC Student Government. Respond with ONLY valid JSON, no markdown.

Categories (pick exactly one):
- laws: Laws, statutes, legal codes, regulations, compliance
- policies: Policies, governance procedures, bylaws, resolutions
- resources: Resources, services, support programs, wellness
- academic: Academic affairs, courses, faculty, research
- budget: Budget, finance, funding, allocations, fiscal
- student-life: Student orgs, clubs, events, housing, campus life
- general: Anything that doesn't clearly fit above

Return this exact JSON shape:
{
  "category": "one-of-the-above",
  "confidence": 0.0 to 1.0,
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "One sentence summary of the document",
  "document_type": "statute|policy|report|guide|form|memo|other"
}`
      },
      {
        role: 'user',
        content: `Classify this document:\n\nTitle: ${title}\n\nPreview:\n${preview}`
      }
    ]

    const raw = await callGrok(messages)
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const classification = JSON.parse(cleaned)

    return res.status(200).json({
      ...classification,
      commit_id: commitId,
      classified_at: new Date().toISOString(),
      model: 'grok-4',
    })
  } catch (err) {
    console.error('Classification error:', err)
    return res.status(500).json({ error: 'Classification failed: ' + err.message })
  }
}

export default withAdminAuth(handler)
