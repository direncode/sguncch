import { getApprovalLog } from '../../../lib/codex'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { document_id } = req.query
    const { data, error } = await getApprovalLog(document_id || null)

    if (error) return res.status(500).json({ error })
    return res.status(200).json({ audit_log: data })
  } catch (err) {
    console.error('Audit log error:', err)
    return res.status(500).json({ error: 'Failed to fetch audit log' })
  }
}
