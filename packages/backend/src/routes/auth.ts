/**
 * Project Bold Platform - Authentication Routes
 *
 * Handles SAML/Shibboleth SSO integration with mock mode for development.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { authService } from '../services/auth.service.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, authRateLimiter } from '../middleware/auth.js';

const router = Router();

/**
 * GET /auth/login
 * Initiates SAML login flow or returns mock login options
 */
router.get('/login', authRateLimiter, (_req: Request, res: Response) => {
  if (config.saml.mockMode) {
    res.json({
      success: true,
      data: {
        mockMode: true,
        message: 'SAML mock mode enabled. Use POST /auth/mock-login with role parameter.',
        availableRoles: ['student', 'org_leader', 'senator', 'cabinet', 'admin'],
        mockLoginUrl: `${config.apiUrl}/auth/mock-login`,
      },
    });
  } else {
    res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_CONFIG_REQUIRED',
        message: 'Production SAML authentication requires ITS registration. Contact UNC ITS for metadata exchange.',
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
        },
      },
    });
  })
);

/**
 * GET /auth/saml/metadata
 * Returns SAML SP metadata for ITS registration
 */
router.get('/saml/metadata', (_req: Request, res: Response) => {
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
    const userId = req.user?.sub;
    if (userId) {
      await authService.logout(userId);
    }

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
    res.json({
      success: true,
      data: {
        id: req.user?.sub,
        pid: req.user?.pid,
        roles: req.user?.roles,
      },
    });
  })
);

/**
 * GET /auth/login-failed
 * Handle failed SAML authentication
 */
router.get('/login-failed', (_req: Request, res: Response) => {
  res.redirect(`${config.appUrl}/login?error=authentication_failed`);
});

/**
 * GET /auth/mock-users (dev only)
 * List available mock users for testing
 */
router.get('/mock-users', (_req: Request, res: Response) => {
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
      users: Object.entries(mockUsers).map(([role, user]) => ({
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
