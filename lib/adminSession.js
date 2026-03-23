/**
 * Admin Session Helper
 *
 * Manages the admin authentication token and team role in sessionStorage.
 * The admin key is NEVER imported from data.js on the client side.
 * Instead, the user enters their key at login, it's validated server-side,
 * and the entered key is stored in sessionStorage for API calls.
 */

const ADMIN_TOKEN_KEY = 'projectbold_admin_token'
const ADMIN_ROLE_KEY = 'projectbold_admin_role'

/**
 * Store the admin token after successful login.
 */
export function setAdminToken(token) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

/**
 * Get the stored admin token for API calls.
 */
export function getAdminToken() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || null
}

/**
 * Clear the admin token on logout.
 */
export function clearAdminToken() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

/**
 * Store the admin role after successful login.
 */
export function setAdminRole(role) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ADMIN_ROLE_KEY, role)
}

/**
 * Get the stored admin role.
 */
export function getAdminRole() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ADMIN_ROLE_KEY) || null
}

/**
 * Clear the admin role on logout.
 */
export function clearAdminRole() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ADMIN_ROLE_KEY)
}

/**
 * Build Authorization headers for admin API calls.
 * Returns headers object with Content-Type and Bearer token.
 */
export function getAuthHeaders() {
  const token = getAdminToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}
