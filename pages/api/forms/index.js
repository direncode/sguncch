import { withAdminAuth } from '../../../lib/auth'
import { getFormSubmissions, updateFormSubmission } from '../../../lib/supabase'
import { createLogger } from '../../../lib/logger'

const log = createLogger('API:forms')

async function handler(req, res) {
  if (req.method === 'GET') {
    const { formType } = req.query

    try {
      const { data, error } = await getFormSubmissions(formType || null)
      if (error) {
        return res.status(200).json({ data: [], error })
      }
      return res.status(200).json({ data })
    } catch (err) {
      log.error('Get form submissions error', { error: err.message })
      return res.status(200).json({ data: [], error: 'Failed to fetch submissions' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, status, adminNote } = req.body
    if (!id) {
      return res.status(400).json({ error: 'Submission ID is required' })
    }

    try {
      const updates = {}
      if (status) updates.status = status
      if (adminNote !== undefined) updates.admin_note = adminNote

      const { data, error } = await updateFormSubmission(id, updates)
      if (error) {
        return res.status(500).json({ error })
      }
      return res.status(200).json({ data })
    } catch (err) {
      log.error('Update form submission error', { error: err.message })
      return res.status(500).json({ error: 'Failed to update submission' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
