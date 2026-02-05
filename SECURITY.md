# Security Documentation

## Overview

This document outlines the security measures implemented in Project Bold and provides guidance for secure deployment.

## Security Features

### 1. Authentication

- **Admin Key**: Stored as environment variable (`ADMIN_KEY`), not in source code
- **Secure Comparison**: Uses time-constant comparison to prevent timing attacks
- **Session Management**: Sessions expire after 4 hours of inactivity
- **Rate Limiting**: Login attempts limited to 5 per 15 minutes to prevent brute force

### 2. Input Validation & Sanitization

All user inputs are sanitized using the utilities in `lib/security.js`:

- `sanitizeText()` - Strips HTML and encodes special characters
- `sanitizeEmail()` - Validates and normalizes email addresses
- `sanitizeURL()` - Validates URLs and blocks dangerous protocols
- `sanitizePhone()` - Removes invalid characters from phone numbers
- `sanitizeObject()` - Recursively sanitizes all object properties
- `validateFormData()` - Schema-based validation with type checking

### 3. XSS Prevention

- Content Security Policy (CSP) headers restrict script sources
- All user inputs are sanitized before display
- `containsXSS()` function detects potential XSS attempts
- HTML tags are encoded in text inputs

### 4. Rate Limiting

Client-side and server-side rate limiting protects against abuse:

| Action | Limit | Window |
|--------|-------|--------|
| API requests | 100 | 1 minute |
| Login attempts | 5 | 15 minutes |
| Form submissions | 10 | 1 minute |
| Feedback submissions | 5 | 1 hour |

### 5. Security Headers

The following headers are set via `next.config.js`:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Restricts browser features
- `Content-Security-Policy` - Restricts resource loading
- `Strict-Transport-Security` - Enforces HTTPS

### 6. API Security

- HTTP method validation on all API routes
- Rate limiting middleware
- Error messages sanitized in production
- No sensitive data in error responses

## Environment Variables

### Required for Production

```bash
# Admin authentication key (REQUIRED - change from default!)
ADMIN_KEY=your-secure-random-key-here

# Generate with: openssl rand -base64 32
```

### Optional

```bash
# Web3Forms API key for form submissions
NEXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-key

# Supabase for persistent storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL for CORS
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Deployment Checklist

### Before Deploying to Production

- [ ] Set a strong `ADMIN_KEY` environment variable
- [ ] Verify all environment variables are configured
- [ ] Run `npm audit` to check for dependency vulnerabilities
- [ ] Review CSP headers for your specific needs
- [ ] Test rate limiting is working
- [ ] Verify HTTPS is enforced
- [ ] Test authentication flow works correctly
- [ ] Review and update allowed domains in CSP if needed

### Vercel Deployment

1. Go to Project Settings > Environment Variables
2. Add all required environment variables
3. Deploy from the production branch
4. Verify security headers in Network tab

### Docker/Self-Hosted

1. Create `.env.local` from `.env.example`
2. Set all required variables
3. Ensure HTTPS is configured (use reverse proxy)
4. Set up proper firewall rules

## Security Limitations

### Known Limitations

1. **Client-Side Authentication**: Admin authentication is primarily client-side. For high-security needs, implement server-side sessions with a database.

2. **LocalStorage**: Data stored in localStorage is not encrypted. Avoid storing sensitive information.

3. **In-Memory Rate Limiting**: Server-side rate limiting uses in-memory storage. For multi-instance deployments, use Redis.

4. **No Email Verification**: User emails are not verified. Consider adding verification for critical operations.

### Recommendations for Enhanced Security

1. **Add Server-Side Sessions**: Use a database-backed session store for production
2. **Implement CSRF Tokens**: Add CSRF protection for state-changing operations
3. **Use Redis for Rate Limiting**: For horizontal scaling
4. **Add Audit Logging**: Log security events to a persistent store
5. **Enable Two-Factor Authentication**: For admin access

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. Do not create a public GitHub issue
2. Email the security team directly
3. Allow time for a fix before public disclosure

## Security Updates

Keep dependencies updated:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

## Files Reference

| File | Purpose |
|------|---------|
| `lib/security.js` | Security utilities (sanitization, validation, sessions) |
| `lib/rateLimit.js` | Rate limiting middleware |
| `next.config.js` | Security headers configuration |
| `lib/data.js` | Environment variable configuration |
| `lib/store.js` | Secure authentication implementation |
| `lib/integrations.js` | Secure form submission handling |

---

Last updated: January 2026
