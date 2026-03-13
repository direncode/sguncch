import { getDocumentById, getApprovalLog } from '../../../../../lib/codex'
import { createLogger } from '../../../../../lib/logger'

const log = createLogger('API:document-detail')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    const { data: doc, error } = await getDocumentById(id)
    if (error || !doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Only allow public access to approved documents
    if (doc.status !== 'approved') {
      return res.status(404).json({ error: 'Document not found' })
    }

    const { data: auditLog } = await getApprovalLog(id)

    return res.status(200).json({
      document: doc,
      audit_log: auditLog || [],
    })
  } catch (err) {
    log.error('Document detail error', { error: err.message })
    return res.status(500).json({ error: 'Failed to fetch document' })
  }
}
