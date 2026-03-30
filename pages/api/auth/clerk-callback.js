import { getAuth } from '@clerk/nextjs/server'
import { generateSessionToken } from '../../../lib/auth'
import {
  getAdminAccountByClerkId,
  getAdminAccountByEmail,
  linkClerkIdToAccount,
  updateAdminAccount,
} from '../../../lib/supabase'

// Allowed Google emails that can sign in as admins
// Set CLERK_ALLOWED_EMAILS in .env.local as comma-separated emails
function getAllowedEmails() {
  const raw = process.env.CLERK_ALLOWED_EMAILS || ''
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify the user is actually signed in with Clerk
  const { userId: clerkUserId } = getAuth(req)
  if (!clerkUserId) {
    return res.status(401).json({ error: 'Not authenticated with Clerk' })
  }

  const { email, name } = req.body || {}
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    // 1. Check if this Clerk user is already linked to an admin account
    const { data: existingByClerk } = await getAdminAccountByClerkId(clerkUserId)
    if (existingByClerk) {
      const sessionToken = generateSessionToken(existingByClerk.id, existingByClerk.team_role)
      updateAdminAccount(existingByClerk.id, { last_login: new Date().toISOString() }).catch(() => {})

      return res.status(200).json({
        success: true,
        role: existingByClerk.team_role,
        sessionToken,
        account: {
          id: existingByClerk.id,
          username: existingByClerk.username,
          display_name: existingByClerk.display_name,
          team_role: existingByClerk.team_role,
          avatar_color: existingByClerk.avatar_color,
          bio: existingByClerk.bio,
        },
      })
    }

    // 2. Check if there's an existing admin account with this email
    const { data: existingByEmail } = await getAdminAccountByEmail(normalizedEmail)
    if (existingByEmail) {
      // Link this Clerk user to the existing account
      await linkClerkIdToAccount(existingByEmail.id, clerkUserId, normalizedEmail)
      const sessionToken = generateSessionToken(existingByEmail.id, existingByEmail.team_role)
      updateAdminAccount(existingByEmail.id, { last_login: new Date().toISOString() }).catch(() => {})

      return res.status(200).json({
        success: true,
        role: existingByEmail.team_role,
        sessionToken,
        account: {
          id: existingByEmail.id,
          username: existingByEmail.username,
          display_name: existingByEmail.display_name,
          team_role: existingByEmail.team_role,
          avatar_color: existingByEmail.avatar_color,
          bio: existingByEmail.bio,
        },
      })
    }

    // 3. Check if this email is in the allowed list for new admin creation
    const allowedEmails = getAllowedEmails()
    if (allowedEmails.length > 0 && !allowedEmails.includes(normalizedEmail)) {
      return res.status(403).json({
        error: 'This Google account is not authorized for admin access. Contact a team lead to get added.',
      })
    }

    // If no allowed emails are configured, deny by default for security
    if (allowedEmails.length === 0) {
      return res.status(403).json({
        error: 'Google sign-in is not configured yet. Set CLERK_ALLOWED_EMAILS in your environment.',
      })
    }

    // 4. Auto-create a new admin account for this allowed email
    // Default role is 'leads' — can be changed in admin profile later
    const { supabase } = await import('../../../lib/supabase')
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' })
    }

    const newAccount = {
      username: normalizedEmail.split('@')[0],
      display_name: name || normalizedEmail.split('@')[0],
      team_role: 'leads',
      password_hash: 'clerk_oauth_' + clerkUserId, // Not a real password — OAuth only
      email: normalizedEmail,
      clerk_id: clerkUserId,
      avatar_color: '#4B9CD3',
      bio: '',
    }

    const { data: created, error: createError } = await supabase
      .from('admin_accounts')
      .insert(newAccount)
      .select()
      .single()

    if (createError) {
      console.error('Failed to create admin account:', createError)
      return res.status(500).json({ error: 'Failed to create account' })
    }

    const sessionToken = generateSessionToken(created.id, created.team_role)

    return res.status(200).json({
      success: true,
      role: created.team_role,
      sessionToken,
      account: {
        id: created.id,
        username: created.username,
        display_name: created.display_name,
        team_role: created.team_role,
        avatar_color: created.avatar_color,
        bio: created.bio,
      },
    })
  } catch (err) {
    console.error('Clerk callback error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}
