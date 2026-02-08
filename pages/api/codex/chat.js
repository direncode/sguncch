import { searchRelevantChunks, callGrok, isEmbeddingAvailable } from '../../../lib/embeddings'
import { getDocumentById } from '../../../lib/codex'

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
    const { question } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' })
    }

    if (!isEmbeddingAvailable()) {
      return res.status(503).json({ error: 'AI service is not configured. Please contact an administrator.' })
    }

    // Search for relevant chunks
    const chunks = await searchRelevantChunks(question, 5)

    if (!chunks || chunks.length === 0) {
      return res.status(200).json({
        answer: 'I could not find any relevant information in the approved governance documents to answer your question. Please try rephrasing or ask about a different topic.',
        sources: [],
        model: 'grok-3',
      })
    }

    // Fetch parent document metadata for each chunk
    const docCache = {}
    const sourcesWithMeta = []

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

    // Build context for Grok
    const contextBlocks = sourcesWithMeta.map((s, i) =>
      `[Source ${i + 1}: "${s.title}" v${s.version}, Section: ${s.section}, Approved: ${new Date(s.approved_at).toLocaleDateString()}]\n${s.chunk_text}`
    ).join('\n\n---\n\n')

    const systemPrompt = `You are the UNC Gov Codex Assistant, an AI that answers questions about UNC Student Government governance documents.

RULES:
- Answer using ONLY the provided approved document context below
- Always cite your sources using the document title, section, and version
- If the context does not contain enough information to answer, say so clearly
- Be concise, accurate, and helpful
- Format citations as: (Source: "Document Title" v1.0, Section Name)

APPROVED DOCUMENT CONTEXT:
${contextBlocks}`

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
      model: 'grok-3',
    })
  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'Failed to generate response. Please try again.' })
  }
}
