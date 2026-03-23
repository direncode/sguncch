import { verifyAdmin, verifyPassword, generateSessionToken } from '../../../lib/auth'
import { getAdminAccountByUsername, getAdminAccountByRole, updateAdminAccount } from '../../../lib/supabase'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Strict rate limit on login: 5 attempts per 15 minutes
  const rl = rateLimit(req, res, 'auth')
  if (!rl.success) {
    return res.status(429).json({ error: rl.message })
  }

  const { username, password } = req.body || {}

  // === Path 1: Username/Password login ===
  if (username && password) {
    try {
      const { data: account, error } = await getAdminAccountByUsername(username)
      if (error || !account) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      const valid = verifyPassword(password, account.password_hash)
      if (!valid) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      // Generate session token
      const sessionToken = generateSessionToken(account.id, account.team_role)

      // Update last login
      updateAdminAccount(account.id, { last_login: new Date().toISOString() }).catch(() => {})

      return res.status(200).json({
        success: true,
        role: account.team_role,
        sessionToken,
        account: {
          id: account.id,
          username: account.username,
          display_name: account.display_name,
          team_role: account.team_role,
          avatar_color: account.avatar_color,
          bio: account.bio,
        },
      })
    } catch (err) {
      console.error('Login error:', err)
      return res.status(500).json({ error: 'Login failed' })
    }
  }

  // === Path 2: Admin key login (existing flow) ===
  const result = verifyAdmin(req)
  if (result.authenticated) {
    // Check if this role has an account
    let account = null
    try {
      const { data } = await getAdminAccountByRole(result.role)
      if (data) {
        account = {
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          team_role: data.team_role,
          avatar_color: data.avatar_color,
          bio: data.bio,
        }
        // Update last login
        updateAdminAccount(data.id, { last_login: new Date().toISOString() }).catch(() => {})
      }
    } catch {
      // Account lookup failed — non-blocking, continue without account
    }

    return res.status(200).json({
      success: true,
      role: result.role,
      account, // null if no account created yet
    })
  }

  return res.status(401).json({ error: 'Invalid admin key' })
}
