/**
 * Project Bold Platform - Authentication Routes
 *
 * Handles SAML/Shibboleth SSO integration with mock mode for development.
 * UNC Shibboleth attributes: PID, onyen, email, eduPersonAffiliation, eduPersonEntitlement
 */

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as SamlStrategy, Profile } from 'passport-saml';
import { config } from '../config/index.js';
import { authService } from '../services/auth.service.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, authRateLimiter } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import type { SAMLAttributes } from '@project-bold/shared';

const router = Router();

// =============================================================================
// SAML STRATEGY CONFIGURATION
// =============================================================================

if (config.saml.enabled && !config.saml.mockMode) {
  const samlStrategy = new SamlStrategy(
    {
      entryPoint: config.saml.entryPoint,
      issuer: config.saml.issuer,
      callbackUrl: config.saml.callbackUrl,
      // In production, load from files
      cert: process.env.SAML_IDP_CERT || '',
      // privateKey: fs.readFileSync(config.saml.privateKeyPath),
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      wantAssertionsSigned: true,
      acceptedClockSkewMs: 5000,
    },
    (profile: Profile, done: (err: Error | null, user?: SAMLAttributes) => void) => {
      // Extract UNC-specific attributes from SAML response
      const samlAttributes: SAMLAttributes = {
        pid: profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'] as string || '',
        onyen: profile['urn:oid:0.9.2342.19200300.100.1.1'] as string || '',
        email: profile.email || profile['urn:oid:0.9.2342.19200300.100.1.3'] as string || '',
        firstName: profile['urn:oid:2.5.4.42'] as string || '',
        lastName: profile['urn:oid:2.5.4.4'] as string || '',
        affiliation: profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.1'] as string || 'student',
        eduPersonEntitlement: profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.7'] as string[] || [],
      };

      logger.info('SAML authentication successful', { onyen: samlAttributes.onyen });
      done(null, samlAttributes);
    }
  );

  passport.use('saml', samlStrategy);
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as SAMLAttributes));

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /auth/login
 * Initiates SAML login flow or returns mock login options
 */
router.get('/login', authRateLimiter, (req: Request, res: Response) => {
  if (config.saml.mockMode) {
    // In mock mode, redirect to mock login endpoint
    res.json({
      success: true,
      data: {
        mockMode: true,
        message: 'SAML mock mode enabled. Use POST /auth/mock-login with role parameter.',
        availableRoles: ['student', 'org_leader', 'senator', 'cabinet', 'admin'],
        mockLoginUrl: `${config.apiUrl}/auth/mock-login`,
      },
    });
  } else if (config.saml.enabled) {
    // Redirect to UNC Shibboleth IdP
    passport.authenticate('saml')(req, res);
  } else {
    res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_DISABLED',
        message: 'Authentication is currently disabled',
      },
    });
  }
});

/**
 * POST /auth/mock-login
 * Mock login for development (only available when SAML_MOCK_MODE=true)
 */
router.post(
  '/mock-login',
  authRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    if (!config.saml.mockMode) {
      throw ApiError.forbidden('Mock login is not available in production');
    }

    const { role = 'student' } = req.body;
    const validRoles = ['student', 'org_leader', 'senator', 'cabinet', 'admin'];

    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const session = await authService.mockLogin(role);

    res.json({
      success: true,
      data: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        user: {
          id: session.userId,
          roles: session.roles,
          ...session.samlAttributes,
        },
      },
    });
  })
);

/**
 * POST /auth/saml/callback
 * SAML assertion consumer service (ACS) endpoint
 */
router.post(
  '/saml/callback',
  passport.authenticate('saml', { session: false, failureRedirect: '/auth/login-failed' }),
  asyncHandler(async (req: Request, res: Response) => {
    const samlAttributes = req.user as SAMLAttributes;

    if (!samlAttributes) {
      throw ApiError.unauthorized('SAML authentication failed');
    }

    const session = await authService.processSAMLResponse(samlAttributes);

    // Redirect to frontend with tokens (in production, use secure cookie or state parameter)
    const redirectUrl = new URL('/auth/callback', config.appUrl);
    redirectUrl.searchParams.set('token', session.accessToken);
    redirectUrl.searchParams.set('refresh', session.refreshToken);

    res.redirect(redirectUrl.toString());
  })
);

/**
 * GET /auth/saml/metadata
 * Returns SAML SP metadata for ITS registration
 */
router.get('/saml/metadata', (req: Request, res: Response) => {
  if (!config.saml.enabled) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SAML_DISABLED',
        message: 'SAML is not configured',
      },
    });
    return;
  }

  // In production, generate proper SP metadata
  const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${config.saml.issuer}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${config.saml.callbackUrl}"
        index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>`;

  res.type('application/xml').send(metadata);
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    const result = await authService.refreshSession(refreshToken);

    if (!result) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /auth/logout
 * Logout and invalidate tokens
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.sub);

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  })
);

/**
 * GET /auth/me
 * Get current authenticated user info
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // In production, fetch full user from database
    res.json({
      success: true,
      data: {
        id: req.user!.sub,
        pid: req.user!.pid,
        roles: req.user!.roles,
      },
    });
  })
);

/**
 * GET /auth/login-failed
 * Handle failed SAML authentication
 */
router.get('/login-failed', (req: Request, res: Response) => {
  res.redirect(`${config.appUrl}/login?error=authentication_failed`);
});

/**
 * GET /auth/mock-users (dev only)
 * List available mock users for testing
 */
router.get('/mock-users', (req: Request, res: Response) => {
  if (!config.saml.mockMode) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only available in mock mode',
      },
    });
    return;
  }

  const mockUsers = authService.getMockUsers();

  res.json({
    success: true,
    data: {
      users: Object.entries(mockUsers!).map(([role, user]) => ({
        role,
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        roles: user.roles,
      })),
    },
  });
});

export default router;
