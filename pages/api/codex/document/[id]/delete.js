import { withAdminAuth } from '../../../../../lib/auth'
import { deleteDocument, getDocumentById } from '../../../../../lib/codex'
import { createLogger } from '../../../../../lib/logger'

const log = createLogger('API:document-delete')

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Document ID is required' })
  }

  try {
    const { data: doc } = await getDocumentById(id)
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const { error } = await deleteDocument(id)
    if (error) {
      return res.status(500).json({ error })
    }

    return res.status(200).json({ message: `Deleted "${doc.title}" and its chunks` })
  } catch (err) {
    log.error('Delete document error', { error: err.message })
    return res.status(500).json({ error: 'Failed to delete document' })
  }
}

export default withAdminAuth(handler)
