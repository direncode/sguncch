import { getDocuments, searchDocuments } from '../../../lib/codex'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { status, search } = req.query

    if (search) {
      const { data, error } = await searchDocuments(search)
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ documents: data })
    }

    const { data, error } = await getDocuments(status || 'approved')
    if (error) return res.status(500).json({ error })
    return res.status(200).json({ documents: data })
  } catch (err) {
    console.error('Documents list error:', err)
    return res.status(500).json({ error: 'Failed to fetch documents' })
  }
}
