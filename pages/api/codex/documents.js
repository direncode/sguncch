import { getDocuments, searchDocuments } from '../../../lib/codex'
import { createLogger } from '../../../lib/logger'

const log = createLogger('API:documents')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { status, search, include_text } = req.query

    if (search) {
      const { data, error } = await searchDocuments(search)
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ documents: data })
    }

    const includeText = include_text === 'true' || include_text === '1'
    const { data, error } = await getDocuments(status || 'approved', { includeText })
    if (error) return res.status(500).json({ error })
    return res.status(200).json({ documents: data })
  } catch (err) {
    log.error('Documents list error', { error: err.message })
    return res.status(500).json({ error: 'Failed to fetch documents' })
  }
}
