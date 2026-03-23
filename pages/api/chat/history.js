import { withAdminAuth } from '../../../lib/auth'
import { getChatHistory, saveChatConversation, deleteChatConversation } from '../../../lib/supabase'

async function handler(req, res) {
  // GET: Fetch conversation history for a user
  if (req.method === 'GET') {
    const userId = req.query.userId || req.userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const { data, error } = await getChatHistory(userId)
    if (error) {
      return res.status(500).json({ error: 'Failed to load chat history' })
    }

    return res.status(200).json({ conversations: data })
  }

  // POST: Save/update a conversation
  if (req.method === 'POST') {
    const { userId, conversationId, title, messages } = req.body

    if (!userId || !messages) {
      return res.status(400).json({ error: 'userId and messages are required' })
    }

    const { data, error } = await saveChatConversation(userId, conversationId, title || 'New Conversation', messages)
    if (error) {
      return res.status(500).json({ error: 'Failed to save conversation' })
    }

    return res.status(200).json({ conversation: data })
  }

  // DELETE: Delete a conversation
  if (req.method === 'DELETE') {
    const { userId, conversationId } = req.body

    if (!userId || !conversationId) {
      return res.status(400).json({ error: 'userId and conversationId are required' })
    }

    const { error } = await deleteChatConversation(userId, conversationId)
    if (error) {
      return res.status(500).json({ error: 'Failed to delete conversation' })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
