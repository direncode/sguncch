import { searchChunksByVector, searchChunksByText } from './codex'

const XAI_BASE_URL = 'https://api.x.ai/v1'

const DEFAULT_XAI_KEY = 'xai-placeholder-set-in-vercel'

function getApiKey() {
  return process.env.XAI_API_KEY || DEFAULT_XAI_KEY
}

export function isEmbeddingAvailable() {
  return Boolean(getApiKey())
}

// ============================================
// EMBEDDING GENERATION (xAI)
// ============================================
export async function generateEmbedding(text) {
  const key = getApiKey()
  if (!key) return null

  try {
    const response = await fetch(`${XAI_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'v1', input: text }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.data?.[0]?.embedding || null
  } catch {
    return null
  }
}

// ============================================
// GROK CHAT COMPLETION
// ============================================
export async function callGrok(messages, { search = false, temperature = 0.3, maxTokens = 1024, model = 'grok-4-1-fast' } = {}) {
  const key = getApiKey()
  if (!key) throw new Error('XAI_API_KEY not configured')

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  }

  // Enable Grok's built-in web search when requested
  if (search) {
    body.search_parameters = {
      mode: 'auto',
      return_citations: true,
      max_search_results: 5,
    }
  }

  const response = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Grok API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content || ''
}

// ============================================
// CHUNK RETRIEVAL (vector + FTS fallback)
// ============================================
export async function searchRelevantChunks(query, limit = 5) {
  if (isEmbeddingAvailable()) {
    const embedding = await generateEmbedding(query)
    if (embedding) {
      const { data } = await searchChunksByVector(embedding, limit)
      if (data && data.length > 0) return data
    }
  }
  // Fallback: full-text search
  const { data } = await searchChunksByText(query, limit)
  return data || []
}

// ============================================
// TEXT CHUNKING
// ============================================
export function chunkText(fullText, maxChunkSize = 700, overlap = 100) {
  const paragraphs = fullText.split(/\n\n+/)
  const chunks = []
  let buffer = ''
  let currentSection = null

  const isHeading = (line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length > 120) return false
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /[A-Z]/.test(trimmed)) return true
    if (/^(Section|Article|Chapter|PART|Title)\s/i.test(trimmed)) return true
    if (/^[IVXLCDM]+\.\s/i.test(trimmed)) return true
    if (/^\d+\.\d*\s/.test(trimmed)) return true
    return false
  }

  const emitChunk = () => {
    if (buffer.trim()) {
      chunks.push({
        chunk_text: buffer.trim(),
        chunk_index: chunks.length,
        section_hint: currentSection,
      })
    }
  }

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    if (isHeading(trimmed)) {
      currentSection = trimmed
    }

    if (buffer.length + trimmed.length + 2 > maxChunkSize && buffer.length > 0) {
      emitChunk()
      // Keep overlap from the end of the previous chunk
      const overlapText = buffer.length > overlap ? buffer.slice(-overlap) : ''
      buffer = overlapText + '\n\n' + trimmed
    } else {
      buffer = buffer ? buffer + '\n\n' + trimmed : trimmed
    }
  }

  emitChunk()

  // If any chunk is still too large, split on sentence boundaries
  const finalChunks = []
  for (const chunk of chunks) {
    if (chunk.chunk_text.length <= maxChunkSize * 1.5) {
      finalChunks.push({ ...chunk, chunk_index: finalChunks.length })
    } else {
      const sentences = chunk.chunk_text.split(/(?<=[.!?])\s+(?=[A-Z])/)
      let subBuffer = ''
      for (const sentence of sentences) {
        if (subBuffer.length + sentence.length + 1 > maxChunkSize && subBuffer) {
          finalChunks.push({
            chunk_text: subBuffer.trim(),
            chunk_index: finalChunks.length,
            section_hint: chunk.section_hint,
          })
          subBuffer = sentence
        } else {
          subBuffer = subBuffer ? subBuffer + ' ' + sentence : sentence
        }
      }
      if (subBuffer.trim()) {
        finalChunks.push({
          chunk_text: subBuffer.trim(),
          chunk_index: finalChunks.length,
          section_hint: chunk.section_hint,
        })
      }
    }
  }

  return finalChunks
}
