import { withAdminAuth } from '../../../lib/auth'
import { updateDocumentStatus, logApprovalAction } from '../../../lib/codex'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { document_id, reason } = req.body

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' })
    }

    const { error } = await updateDocumentStatus(document_id, 'rejected', 'admin', reason)
    if (error) {
      return res.status(500).json({ error: 'Failed to reject document' })
    }

    await logApprovalAction(document_id, 'rejected', 'admin', reason)

    return res.status(200).json({ message: 'Document rejected' })
  } catch (err) {
    console.error('Reject error:', err)
    return res.status(500).json({ error: 'Failed to reject document' })
  }
}

export default withAdminAuth(handler)
