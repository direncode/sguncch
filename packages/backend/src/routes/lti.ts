/**
 * Project Bold Platform - Canvas LTI Routes
 *
 * LTI 1.3 / Advantage integration for the "Student Wellness" button in Canvas.
 * This enables seamless access to wellness resources directly from Canvas.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /lti/config
 * LTI tool configuration for Canvas
 */
router.get('/config', (req: Request, res: Response) => {
  const toolConfig = {
    title: 'Student Wellness - Project Bold',
    description: 'Access mental health, medical, and safety resources',
    oidc_initiation_url: `${config.apiUrl}/lti/login`,
    target_link_uri: `${config.apiUrl}/lti/launch`,
    scopes: [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
    ],
    extensions: [
      {
        platform: 'canvas.instructure.com',
        privacy_level: 'public',
        settings: {
          placements: [
            {
              placement: 'global_navigation',
              message_type: 'LtiResourceLinkRequest',
              target_link_uri: `${config.apiUrl}/lti/launch`,
              text: 'Student Wellness',
              icon_url: `${config.appUrl}/icons/wellness.png`,
            },
            {
              placement: 'course_navigation',
              message_type: 'LtiResourceLinkRequest',
              target_link_uri: `${config.apiUrl}/lti/launch`,
              text: 'Student Wellness',
              default: 'enabled',
              visibility: 'public',
            },
          ],
        },
      },
    ],
    public_jwk_url: `${config.apiUrl}/lti/jwks`,
    custom_fields: {
      canvas_user_id: '$Canvas.user.id',
      canvas_user_login_id: '$Canvas.user.loginId',
      canvas_course_id: '$Canvas.course.id',
    },
  };

  res.json(toolConfig);
});

/**
 * GET /lti/jwks
 * JSON Web Key Set for LTI token verification
 */
router.get('/jwks', (req: Request, res: Response) => {
  // In production, generate and manage RSA keys
  // This is a placeholder structure
  res.json({
    keys: [
      {
        kty: 'RSA',
        alg: 'RS256',
        use: 'sig',
        kid: 'project-bold-lti-key',
        // In production, include actual n and e values from RSA public key
        n: 'placeholder_for_rsa_modulus',
        e: 'AQAB',
      },
    ],
  });
});

/**
 * POST /lti/login
 * OIDC login initiation for LTI 1.3
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    if (!config.canvas.enabled) {
      throw ApiError.badRequest('Canvas LTI integration is not enabled');
    }

    const {
      iss,
      login_hint,
      target_link_uri,
      lti_message_hint,
      client_id,
    } = req.body;

    logger.info('LTI login initiation', { iss, client_id });

    // Validate issuer (should be Canvas)
    if (!iss || !iss.includes('canvas')) {
      throw ApiError.badRequest('Invalid issuer');
    }

    // Build authorization redirect URL
    const state = Buffer.from(JSON.stringify({
      nonce: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    })).toString('base64');

    const nonce = Math.random().toString(36).substring(7);

    const authParams = new URLSearchParams({
      response_type: 'id_token',
      response_mode: 'form_post',
      scope: 'openid',
      client_id: client_id || config.canvas.clientId || '',
      redirect_uri: `${config.apiUrl}/lti/launch`,
      login_hint,
      state,
      nonce,
      prompt: 'none',
    });

    if (lti_message_hint) {
      authParams.set('lti_message_hint', lti_message_hint);
    }

    const authUrl = `${config.canvas.platformUrl}/api/lti/authorize_redirect?${authParams.toString()}`;

    res.redirect(authUrl);
  })
);

/**
 * POST /lti/launch
 * LTI resource link launch handler
 */
router.post(
  '/launch',
  asyncHandler(async (req: Request, res: Response) => {
    if (!config.canvas.enabled) {
      // In non-Canvas mode, redirect to wellness page directly
      res.redirect(`${config.appUrl}/wellness`);
      return;
    }

    const { id_token, state } = req.body;

    if (!id_token) {
      throw ApiError.badRequest('Missing id_token');
    }

    logger.info('LTI launch received');

    // In production:
    // 1. Verify id_token signature using Canvas JWKS
    // 2. Validate claims (iss, aud, exp, nonce)
    // 3. Extract user context from LTI claims
    // 4. Create or update local user session
    // 5. Redirect to appropriate page

    // For now, parse basic claims (NOT PRODUCTION SAFE)
    try {
      const claims = JSON.parse(
        Buffer.from(id_token.split('.')[1], 'base64').toString()
      );

      const launchContext = {
        userId: claims.sub,
        canvasUserId: claims['https://purl.imsglobal.org/spec/lti/claim/custom']?.canvas_user_id,
        courseId: claims['https://purl.imsglobal.org/spec/lti/claim/custom']?.canvas_course_id,
        roles: claims['https://purl.imsglobal.org/spec/lti/claim/roles'] || [],
        name: claims.name,
        email: claims.email,
      };

      logger.info('LTI launch context', { userId: launchContext.canvasUserId });

      // Redirect to wellness dashboard with context
      const redirectUrl = new URL('/wellness', config.appUrl);
      redirectUrl.searchParams.set('lti', 'true');

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('LTI launch token parse error', { error });
      throw ApiError.badRequest('Invalid launch token');
    }
  })
);

/**
 * GET /lti/deep-link
 * Deep linking response builder (for content selection)
 */
router.get(
  '/deep-link',
  asyncHandler(async (req: Request, res: Response) => {
    // Return available content items for deep linking
    const contentItems = [
      {
        type: 'ltiResourceLink',
        title: 'Mental Health Resources',
        url: `${config.apiUrl}/lti/launch?resource=mental-health`,
        text: 'Access CAPS and counseling resources',
      },
      {
        type: 'ltiResourceLink',
        title: 'Campus Health',
        url: `${config.apiUrl}/lti/launch?resource=health`,
        text: 'Medical services and appointments',
      },
      {
        type: 'ltiResourceLink',
        title: 'Safety Resources',
        url: `${config.apiUrl}/lti/launch?resource=safety`,
        text: 'SafeWalk, emergency contacts, and ride programs',
      },
      {
        type: 'ltiResourceLink',
        title: 'Harm Reduction',
        url: `${config.apiUrl}/lti/launch?resource=harm-reduction`,
        text: 'Plan B, Narcan, and education',
      },
    ];

    res.json({
      success: true,
      data: contentItems,
    });
  })
);

export default router;
