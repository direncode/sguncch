import { getDocuments } from '../../../lib/codex'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, category } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' })
  }

  try {
    const { data: documents } = await getDocuments('approved', { includeText: true })
    if (!documents || documents.length === 0) {
      return res.status(200).json({ results: [], total: 0 })
    }

    const query = q.trim().toLowerCase()
    const results = []

    for (const doc of documents) {
      // Filter by category if specified
      if (category && doc.category !== category) continue

      const titleLower = (doc.title || '').toLowerCase()
      const textLower = (doc.text_full || '').toLowerCase()

      const titleMatch = titleLower.includes(query)
      const textMatch = textLower.includes(query)

      if (!titleMatch && !textMatch) continue

      // Find snippet with context
      let snippet = ''
      if (textMatch) {
        const idx = textLower.indexOf(query)
        const start = Math.max(0, idx - 100)
        const end = Math.min(textLower.length, idx + query.length + 100)
        snippet = (start > 0 ? '...' : '') + doc.text_full.slice(start, end) + (end < doc.text_full.length ? '...' : '')
      }

      results.push({
        id: doc.id,
        title: doc.title,
        version: doc.version,
        category: doc.category || 'general',
        summary: doc.summary || null,
        snippet,
        titleMatch,
        textMatch,
        char_count: doc.text_full?.length || 0,
        approved_at: doc.approved_at,
      })
    }

    return res.status(200).json({
      results,
      total: results.length,
      query: q,
    })
  } catch (err) {
    console.error('Search error:', err)
    return res.status(500).json({ error: 'Search failed' })
  }
}
