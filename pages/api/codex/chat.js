import { searchRelevantChunks, callGrok, isEmbeddingAvailable } from '../../../lib/embeddings'
import { getDocumentById, getDocuments } from '../../../lib/codex'
import { buildPlatformContext, buildEnhancedSystemPrompt } from '../../../lib/platformContext'
import { MIN_SEED_COUNT } from '../../../lib/scrollRegistry'
import { getNewsSourcesContext } from '../../../lib/newsSources'

// Stricter rate limiting: 5 requests per minute per IP
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

// Quick relevance check — determines if question is UNC-related
async function checkRelevance(question) {
  try {
    const result = await callGrok([
      {
        role: 'system',
        content: `You are a relevance classifier. Respond with ONLY "relevant" or "irrelevant".
A question is "relevant" if it relates to ANY of these topics:
- UNC-Chapel Hill (university, campus, students, faculty, staff)
- Student government, governance, policies, codes, constitutions
- University budget, funding, fees, financial matters
- Campus operations, services, programs, departments
- Higher education policy in North Carolina
- Student life, organizations, housing, dining, health, safety
- Chapel Hill / Triangle area as it relates to UNC
- General questions about governance, transparency, accountability
- Questions about The Scroll, Grok, or this platform

A question is "irrelevant" if it has NOTHING to do with UNC, university governance, or education.
Be generous — if there's any reasonable connection to UNC or university topics, say "relevant".`
      },
      { role: 'user', content: question }
    ], { temperature: 0, maxTokens: 10 })
    return result.trim().toLowerCase().includes('relevant')
  } catch {
    // If relevance check fails, allow the question through
    return true
  }
}

// Determine if question needs web search (current events, news, recent info)
function needsWebSearch(question) {
  const q = question.toLowerCase()
  const webKeywords = [
    'latest', 'recent', 'news', 'today', 'yesterday', 'this week', 'this month',
    'current', 'update', 'announcement', 'daily tar heel', 'dth',
    'happening', 'event', 'upcoming', 'schedule', 'when is', 'when does',
    'breaking', 'report', 'article', 'published', 'press', 'release',
    'election', 'vote', 'result', 'appointed', 'resigned', 'hired',
    'chapel hill', 'chapelboro', 'nc general assembly',
  ]
  return webKeywords.some(kw => q.includes(kw))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit check
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. You can ask 5 questions per minute.' })
  }

  try {
    const { question, platformData, isAdminMode } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' })
    }

    if (question.trim().length > 2000) {
      return res.status(400).json({ error: 'Question too long (max 2000 characters)' })
    }

    if (!isEmbeddingAvailable()) {
      return res.status(503).json({ error: 'AI service is not configured. Please contact an administrator.' })
    }

    // Gate: The Scroll must have seed documents before chat is available
    const { data: approvedDocs } = await getDocuments('approved')
    if (!approvedDocs || approvedDocs.length < MIN_SEED_COUNT) {
      return res.status(422).json({
        error: 'scroll_empty',
        message: 'The Scroll needs to be seeded with governing documents before Grok can answer questions. An admin must upload .txt versions of the official UNC governing documents first.',
      })
    }

    // === Relevance gate ===
    const isRelevant = await checkRelevance(question)
    if (!isRelevant) {
      return res.status(200).json({
        answer: 'I can only answer questions related to UNC-Chapel Hill, student government, governance policies, campus operations, budget, and student services. If you have a question about any of those topics, I\'d be happy to help.',
        sources: [],
        model: 'grok-4',
        filtered: true,
      })
    }

    // === Determine if web search is needed ===
    const useWebSearch = needsWebSearch(question)

    // === 1. Search for relevant document chunks ===
    const chunks = await searchRelevantChunks(question, 5)

    let documentContext = ''
    const sourcesWithMeta = []

    if (chunks && chunks.length > 0) {
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

      documentContext = sourcesWithMeta.map((s, i) =>
        `[Source ${i + 1}: "${s.title}" v${s.version}, Section: ${s.section}, Approved: ${new Date(s.approved_at).toLocaleDateString()}]\n${s.chunk_text}`
      ).join('\n\n---\n\n')
    }

    // === 2. Build platform context from client-provided data ===
    let platformContextStr = ''
    if (platformData && typeof platformData === 'object') {
      platformContextStr = buildPlatformContext(platformData)
    }

    // === 2b. For admin mode, append Scroll metadata summary ===
    let adminContext = ''
    if (isAdminMode) {
      try {
        if (approvedDocs && approvedDocs.length > 0) {
          adminContext = `\n\n## SCROLL KNOWLEDGE BASE (Admin View)\n`
          adminContext += `Total approved documents: ${approvedDocs.length}\n`
          adminContext += `Documents:\n`
          for (const doc of approvedDocs.slice(0, 30)) {
            adminContext += `- ${doc.title} (v${doc.version}, approved: ${doc.approved_at || 'unknown'})\n`
          }
          if (approvedDocs.length > 30) {
            adminContext += `... and ${approvedDocs.length - 30} more\n`
          }
        }
      } catch { /* non-blocking */ }
    }

    // === 2c. Append news sources context when web search is active ===
    let newsContext = ''
    if (useWebSearch) {
      newsContext = `\n\n## UNC NEWS SOURCES (Web Search Active)\nGrok has web search enabled for this query. Prioritize these trusted UNC sources:\n${getNewsSourcesContext()}`
    }

    // === 3. Build the enhanced system prompt ===
    const systemPrompt = buildEnhancedSystemPrompt(
      documentContext,
      platformContextStr + adminContext + newsContext,
      isAdminMode
    )

    // === 4. Call Grok (with web search if needed) ===
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]

    const answer = await callGrok(messages, { search: useWebSearch })

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
      webSearchUsed: useWebSearch,
      platformContextIncluded: Boolean(platformContextStr),
    })
  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'Failed to generate response. Please try again.' })
  }
}
