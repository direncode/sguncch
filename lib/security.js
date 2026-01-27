// ============================================
// SECURITY UTILITIES
// Input sanitization, validation, and security helpers
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes script tags, event handlers, and dangerous attributes
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return input

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs (can be used for XSS)
    .replace(/data:/gi, '')
    // Remove vbscript: URLs
    .replace(/vbscript:/gi, '')
    // Encode potentially dangerous characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Sanitize text input - strips all HTML
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return input

  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return ''

  // Basic email format validation and sanitization
  const sanitized = email.trim().toLowerCase()

  // Check for valid email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(sanitized)) {
    return ''
  }

  return sanitized
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') return ''

  const sanitized = url.trim()

  // Only allow http, https protocols
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    return ''
  }

  // Block javascript: and data: protocols that could be embedded
  if (/javascript:|data:|vbscript:/i.test(sanitized)) {
    return ''
  }

  try {
    // Validate URL structure
    new URL(sanitized)
    return sanitized
  } catch {
    return ''
  }
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return ''

  // Remove all non-numeric characters except + for international
  return phone.replace(/[^\d+\-() ]/g, '').trim()
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input, { min, max, integer = false } = {}) {
  let num = parseFloat(input)

  if (isNaN(num)) return 0

  if (integer) num = Math.floor(num)
  if (typeof min === 'number') num = Math.max(min, num)
  if (typeof max === 'number') num = Math.min(max, num)

  return num
}

/**
 * Sanitize object keys and values recursively
 */
export function sanitizeObject(obj, options = {}) {
  const { maxDepth = 5, depth = 0 } = options

  if (depth > maxDepth) return {}

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, { ...options, depth: depth + 1 }))
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key (remove special characters)
      const sanitizedKey = key.replace(/[<>"'&]/g, '')

      if (typeof value === 'string') {
        sanitized[sanitizedKey] = sanitizeText(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = sanitizeObject(value, { ...options, depth: depth + 1 })
      } else {
        sanitized[sanitizedKey] = value
      }
    }
    return sanitized
  }

  return obj
}

/**
 * Validate form data with schema
 */
export function validateFormData(data, schema) {
  const errors = {}
  const sanitizedData = {}

  for (const [field, rules] of Object.entries(schema)) {
    let value = data[field]

    // Required field check
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rules.message || `${field} is required`
      continue
    }

    // Skip validation if field is empty and not required
    if (!value && !rules.required) {
      sanitizedData[field] = ''
      continue
    }

    // Type-specific sanitization
    switch (rules.type) {
      case 'email':
        value = sanitizeEmail(value)
        if (rules.required && !value) {
          errors[field] = 'Invalid email address'
        }
        break
      case 'url':
        value = sanitizeURL(value)
        if (rules.required && !value) {
          errors[field] = 'Invalid URL'
        }
        break
      case 'phone':
        value = sanitizePhone(value)
        break
      case 'number':
        value = sanitizeNumber(value, rules)
        break
      case 'text':
      default:
        value = sanitizeText(value)
    }

    // Min/max length validation for strings
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be no more than ${rules.maxLength} characters`
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${field} format is invalid`
    }

    sanitizedData[field] = value
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData,
  }
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Generate a CSRF token
 */
export function generateCSRFToken() {
  if (typeof window === 'undefined') return ''

  // Generate a random token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

  // Store in sessionStorage (not accessible via XSS from other tabs)
  sessionStorage.setItem('csrf_token', token)

  return token
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token) {
  if (typeof window === 'undefined') return false

  const storedToken = sessionStorage.getItem('csrf_token')
  return storedToken && token === storedToken
}

/**
 * Get the current CSRF token or generate a new one
 */
export function getCSRFToken() {
  if (typeof window === 'undefined') return ''

  const existing = sessionStorage.getItem('csrf_token')
  if (existing) return existing

  return generateCSRFToken()
}

// ============================================
// SECURE SESSION MANAGEMENT
// ============================================

const SESSION_KEY = 'projectbold_session'
const SESSION_DURATION = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

/**
 * Create a secure session hash
 */
export function createSessionHash(key) {
  if (typeof window === 'undefined') return null

  // Create a hash of the admin key + timestamp + random value
  const timestamp = Date.now()
  const random = crypto.getRandomValues(new Uint8Array(16))
  const randomStr = Array.from(random, b => b.toString(16).padStart(2, '0')).join('')

  // Simple hash for session validation (not for password storage)
  const sessionData = {
    hash: btoa(`${key}:${timestamp}:${randomStr}`),
    created: timestamp,
    expires: timestamp + SESSION_DURATION,
  }

  return sessionData
}

/**
 * Store session securely
 */
export function storeSession(sessionData) {
  if (typeof window === 'undefined') return

  // Store in sessionStorage (cleared when browser closes)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
}

/**
 * Validate current session
 */
export function validateSession() {
  if (typeof window === 'undefined') return false

  try {
    const sessionStr = sessionStorage.getItem(SESSION_KEY)
    if (!sessionStr) return false

    const session = JSON.parse(sessionStr)

    // Check if session has expired
    if (Date.now() > session.expires) {
      clearSession()
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Clear session
 */
export function clearSession() {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem('csrf_token')
}

/**
 * Extend session expiry
 */
export function extendSession() {
  if (typeof window === 'undefined') return

  try {
    const sessionStr = sessionStorage.getItem(SESSION_KEY)
    if (!sessionStr) return

    const session = JSON.parse(sessionStr)
    session.expires = Date.now() + SESSION_DURATION
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Session invalid, do nothing
  }
}

// ============================================
// RATE LIMITING (Client-Side)
// ============================================

const rateLimitStore = new Map()

/**
 * Client-side rate limiter for form submissions
 */
export function checkRateLimit(action, { maxAttempts = 5, windowMs = 60000 } = {}) {
  const now = Date.now()
  const key = `ratelimit_${action}`

  // Get existing attempts
  let attempts = rateLimitStore.get(key) || []

  // Filter to only attempts within the window
  attempts = attempts.filter(timestamp => now - timestamp < windowMs)

  // Check if rate limited
  if (attempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...attempts)
    const resetTime = oldestAttempt + windowMs
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((resetTime - now) / 1000),
    }
  }

  // Add new attempt
  attempts.push(now)
  rateLimitStore.set(key, attempts)

  return {
    allowed: true,
    remaining: maxAttempts - attempts.length,
    resetIn: 0,
  }
}

// ============================================
// SECURE ADMIN KEY COMPARISON
// ============================================

/**
 * Time-constant string comparison to prevent timing attacks
 */
export function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  // Ensure both strings are the same length for comparison
  const aLen = a.length
  const bLen = b.length

  // Use the max length to prevent length-based timing leaks
  const maxLen = Math.max(aLen, bLen)

  let result = aLen === bLen ? 0 : 1

  for (let i = 0; i < maxLen; i++) {
    const aChar = i < aLen ? a.charCodeAt(i) : 0
    const bChar = i < bLen ? b.charCodeAt(i) : 0
    result |= aChar ^ bChar
  }

  return result === 0
}

// ============================================
// CONTENT SECURITY
// ============================================

/**
 * Check if content contains potential XSS
 */
export function containsXSS(content) {
  if (typeof content !== 'string') return false

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i,
  ]

  return xssPatterns.some(pattern => pattern.test(content))
}

// ============================================
// EXPORT VALIDATION SCHEMAS
// ============================================

export const schemas = {
  feedback: {
    message: { type: 'text', required: true, minLength: 10, maxLength: 2000 },
    email: { type: 'email', required: false },
    category: { type: 'text', required: true, maxLength: 100 },
  },
  contact: {
    name: { type: 'text', required: true, minLength: 2, maxLength: 100 },
    email: { type: 'email', required: true },
    subject: { type: 'text', required: true, minLength: 5, maxLength: 200 },
    message: { type: 'text', required: true, minLength: 10, maxLength: 5000 },
  },
  volunteerSignup: {
    name: { type: 'text', required: true, minLength: 2, maxLength: 100 },
    email: { type: 'email', required: true },
    phone: { type: 'phone', required: false },
    availability: { type: 'text', required: true, maxLength: 500 },
  },
  eventSafetyPlan: {
    organizationName: { type: 'text', required: true, maxLength: 200 },
    eventName: { type: 'text', required: true, maxLength: 200 },
    eventDate: { type: 'text', required: true },
    expectedAttendance: { type: 'number', required: true, min: 1, max: 10000 },
    contactName: { type: 'text', required: true, maxLength: 100 },
    contactPhone: { type: 'phone', required: true },
  },
}
