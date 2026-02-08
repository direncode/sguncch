import { searchRelevantChunks, callGrok, isEmbeddingAvailable } from '../../../lib/embeddings'
import { getDocumentById } from '../../../lib/codex'
import { buildPlatformContext, buildEnhancedSystemPrompt } from '../../../lib/platformContext'

// In-memory rate limiting
const rateLimitMap = new Map()
const RATE_LIMIT = 10
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

  // Rate limit check
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before asking again.' })
  }

  try {
    const { question, platformData } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' })
    }

    if (!isEmbeddingAvailable()) {
      return res.status(503).json({ error: 'AI service is not configured. Please contact an administrator.' })
    }

    // === 1. Search for relevant document chunks ===
    const chunks = await searchRelevantChunks(question, 5)

    let documentContext = ''
    const sourcesWithMeta = []

    if (chunks && chunks.length > 0) {
      // Fetch parent document metadata for each chunk
      const docCache = {}

      for (const chunk of chunks) {
        if (!docCache[chunk.document_id]) {
          const { data: doc } = await getDocumentById(chunk.document_id)
          docCache[chunk.document_id] = doc
        }
        const doc = docCache[chunk.document_id]
        if (doc) {
          sourcesWithMeta.push({
            document_id: chunk.document_id,
            title: doc.title,
            version: doc.version,
            section: chunk.section_hint || 'General',
            approved_at: doc.approved_at,
            chunk_text: chunk.chunk_text,
          })
        }
      }

      // Build document context blocks
      documentContext = sourcesWithMeta.map((s, i) =>
        `[Source ${i + 1}: "${s.title}" v${s.version}, Section: ${s.section}, Approved: ${new Date(s.approved_at).toLocaleDateString()}]\n${s.chunk_text}`
      ).join('\n\n---\n\n')
    }

    // === 2. Build platform context from client-provided data ===
    let platformContextStr = ''
    if (platformData && typeof platformData === 'object') {
      platformContextStr = buildPlatformContext(platformData)
    }

    // === 3. Build the enhanced system prompt ===
    const systemPrompt = buildEnhancedSystemPrompt(documentContext, platformContextStr)

    // === 4. Call Grok ===
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]

    const answer = await callGrok(messages)

    return res.status(200).json({
      answer,
      sources: sourcesWithMeta.map(s => ({
        document_id: s.document_id,
        title: s.title,
        version: s.version,
        section: s.section,
        approved_at: s.approved_at,
      })),
      model: 'grok-4',
      platformContextIncluded: Boolean(platformContextStr),
    })
  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'Failed to generate response. Please try again.' })
  }
}
