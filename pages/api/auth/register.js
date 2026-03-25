import { verifyAdmin, hashPassword } from '../../../lib/auth'
import { createAdminAccount, getAdminAccountByUsername, getAdminAccountByRole } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Must be authenticated with admin key to register
  const authResult = verifyAdmin(req)
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Unauthorized — login with admin key first' })
  }

  const { username, displayName, password, avatarColor } = req.body

  // Validate inputs
  if (!username || !displayName || !password) {
    return res.status(400).json({ error: 'Username, display name, and password are required' })
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3-30 characters' })
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, dots, and hyphens' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  if (displayName.length < 2 || displayName.length > 50) {
    return res.status(400).json({ error: 'Display name must be 2-50 characters' })
  }

  try {
    // Check if username is taken
    const { data: existing } = await getAdminAccountByUsername(username)
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }

    // Check if this role already has an account
    const { data: roleAccount } = await getAdminAccountByRole(authResult.role)
    if (roleAccount) {
      return res.status(409).json({ error: 'An account already exists for this team role' })
    }

    // Hash password and create account
    const passwordHash = hashPassword(password)
    const { data: account, error } = await createAdminAccount({
      username,
      displayName,
      teamRole: authResult.role,
      passwordHash,
      avatarColor: avatarColor || '#4B9CD3',
    })

    if (error) {
      console.error('Account creation error:', error)
      // Surface specific error for debugging
      if (typeof error === 'string' && error.includes('violates check constraint')) {
        return res.status(400).json({ error: 'Invalid team role value' })
      }
      if (typeof error === 'string' && error.includes('duplicate key')) {
        return res.status(409).json({ error: 'Username already taken' })
      }
      if (typeof error === 'string' && error.includes('relation') && error.includes('does not exist')) {
        return res.status(500).json({ error: 'Database table not set up — run the admin_accounts migration in Supabase' })
      }
      return res.status(500).json({ error: 'Failed to create account: ' + (typeof error === 'string' ? error : 'unknown error') })
    }

    return res.status(201).json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
        display_name: account.display_name,
        team_role: account.team_role,
        avatar_color: account.avatar_color,
        bio: account.bio,
        created_at: account.created_at,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
}
