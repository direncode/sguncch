import { verifyAdmin, hashPassword, verifyPassword } from '../../../lib/auth'
import { getAdminAccountById, updateAdminAccount } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authResult = verifyAdmin(req)
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Need user ID from session token or look up by role
  const userId = authResult.userId
  if (!userId) {
    return res.status(400).json({ error: 'Account-based login required for profile updates' })
  }

  const { displayName, bio, avatarColor, currentPassword, newPassword } = req.body

  try {
    // Password change
    if (currentPassword && newPassword) {
      const { data: account } = await getAdminAccountById(userId)
      if (!account) return res.status(404).json({ error: 'Account not found' })

      const valid = verifyPassword(currentPassword, account.password_hash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })

      const newHash = hashPassword(newPassword)
      await updateAdminAccount(userId, { password_hash: newHash })
      return res.status(200).json({ success: true, message: 'Password changed' })
    }

    // Profile update
    const updates = {}
    if (displayName !== undefined) {
      if (displayName.length < 2 || displayName.length > 50) {
        return res.status(400).json({ error: 'Display name must be 2-50 characters' })
      }
      updates.display_name = displayName
    }
    if (bio !== undefined) updates.bio = (bio || '').slice(0, 200)
    if (avatarColor !== undefined) updates.avatar_color = avatarColor

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' })
    }

    const { data, error } = await updateAdminAccount(userId, updates)
    if (error) return res.status(500).json({ error: 'Failed to update profile' })

    return res.status(200).json({ success: true, account: data })
  } catch (err) {
    console.error('Profile update error:', err)
    return res.status(500).json({ error: 'Profile update failed' })
  }
}
