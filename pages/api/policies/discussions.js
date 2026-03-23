import { withAdminAuth } from '../../../lib/auth'
import { getDiscussions, postDiscussion, getAdminAccountById } from '../../../lib/supabase'

async function handler(req, res) {
  // GET: Fetch messages for a policy
  if (req.method === 'GET') {
    const { policyId } = req.query
    if (!policyId) {
      return res.status(400).json({ error: 'policyId is required' })
    }

    const { data, error } = await getDiscussions(policyId)
    if (error) {
      return res.status(500).json({ error: 'Failed to load discussions' })
    }

    return res.status(200).json({ discussions: data })
  }

  // POST: Post a new message
  if (req.method === 'POST') {
    const { policyId, message } = req.body

    if (!policyId || !message) {
      return res.status(400).json({ error: 'policyId and message are required' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' })
    }

    // Get account info for the poster
    let username = 'admin'
    let displayName = 'Admin'
    let userId = req.userId
    let teamRole = req.adminRole

    if (userId) {
      try {
        const { data: account } = await getAdminAccountById(userId)
        if (account) {
          username = account.username
          displayName = account.display_name
        }
      } catch {
        // Use defaults
      }
    }

    const { data, error } = await postDiscussion({
      policyId,
      userId,
      username,
      displayName,
      teamRole,
      message: message.trim(),
    })

    if (error) {
      return res.status(500).json({ error: 'Failed to post message' })
    }

    return res.status(201).json({ discussion: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
