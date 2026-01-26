/**
 * Project Bold Platform - User Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken, requireOwnerOrAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /users/profile
 * Get current user's profile
 */
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // In production, fetch from database
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
 * PATCH /users/profile
 * Update current user's profile
 */
router.patch(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { bio, interests, major, minor, graduationYear } = req.body;

    // In production, update database
    res.json({
      success: true,
      data: {
        id: req.user!.sub,
        bio,
        interests,
        major,
        minor,
        graduationYear,
        updatedAt: new Date().toISOString(),
      },
    });
  })
);

/**
 * GET /users/preferences
 * Get user preferences
 */
router.get(
  '/preferences',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        emailNotifications: true,
        pushNotifications: true,
        displayTheme: 'system',
        accessibilityMode: false,
        language: 'en',
      },
    });
  })
);

/**
 * PATCH /users/preferences
 * Update user preferences
 */
router.patch(
  '/preferences',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const preferences = req.body;

    res.json({
      success: true,
      data: {
        ...preferences,
        updatedAt: new Date().toISOString(),
      },
    });
  })
);

export default router;
