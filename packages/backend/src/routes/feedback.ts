/**
 * Project Bold Platform - Feedback Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth, requireCabinet } from '../middleware/auth.js';
import { feedbackRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Feedback storage
const feedbackStore: Map<string, {
  id: string;
  userId?: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  status: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}> = new Map();

/**
 * POST /feedback
 * Submit feedback
 */
router.post(
  '/',
  optionalAuth,
  feedbackRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { type, category, subject, message, isAnonymous } = req.body;

    if (!type || !category || !subject || !message) {
      throw ApiError.badRequest('Type, category, subject, and message are required');
    }

    const validTypes = ['suggestion', 'complaint', 'question', 'praise'];
    if (!validTypes.includes(type)) {
      throw ApiError.badRequest(`Type must be one of: ${validTypes.join(', ')}`);
    }

    const feedback = {
      id: `fb-${Date.now()}`,
      userId: isAnonymous ? undefined : req.user?.sub,
      type,
      category,
      subject,
      message,
      isAnonymous: isAnonymous ?? false,
      status: 'received',
      createdAt: new Date().toISOString(),
    };

    feedbackStore.set(feedback.id, feedback);

    res.status(201).json({
      success: true,
      data: {
        id: feedback.id,
        message: 'Thank you for your feedback!',
      },
    });
  })
);

/**
 * GET /feedback
 * List feedback (cabinet/admin only for all, users see their own)
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const isAdmin = req.user!.roles.includes('admin') || req.user!.roles.includes('cabinet_member');

    let feedbackList = Array.from(feedbackStore.values());

    if (!isAdmin) {
      feedbackList = feedbackList.filter(f => f.userId === userId);
    }

    // Sort by most recent
    feedbackList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: feedbackList,
    });
  })
);

/**
 * GET /feedback/:id
 * Get single feedback item
 */
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const feedback = feedbackStore.get(id);

    if (!feedback) {
      throw ApiError.notFound('Feedback not found');
    }

    // Check access
    const isAdmin = req.user!.roles.includes('admin') || req.user!.roles.includes('cabinet_member');
    if (!isAdmin && feedback.userId !== req.user!.sub) {
      throw ApiError.forbidden('You can only view your own feedback');
    }

    res.json({
      success: true,
      data: feedback,
    });
  })
);

/**
 * POST /feedback/:id/respond
 * Respond to feedback (cabinet/admin only)
 */
router.post(
  '/:id/respond',
  authenticateToken,
  requireCabinet,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { response } = req.body;

    const feedback = feedbackStore.get(id);

    if (!feedback) {
      throw ApiError.notFound('Feedback not found');
    }

    if (!response) {
      throw ApiError.badRequest('Response is required');
    }

    feedback.response = response;
    feedback.respondedBy = req.user!.sub;
    feedback.respondedAt = new Date().toISOString();
    feedback.status = 'responded';

    feedbackStore.set(id, feedback);

    res.json({
      success: true,
      data: feedback,
    });
  })
);

/**
 * GET /feedback/categories
 * List feedback categories
 */
router.get(
  '/meta/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = [
      { id: 'general', name: 'General Feedback' },
      { id: 'academic-affairs', name: 'Academic Affairs' },
      { id: 'basic-needs', name: 'Basic Needs' },
      { id: 'civic-engagement', name: 'Civic Engagement' },
      { id: 'dei', name: 'Diversity, Equity & Inclusion' },
      { id: 'wellness-safety', name: 'Wellness & Safety' },
      { id: 'environmental', name: 'Environmental Affairs' },
      { id: 'state-external', name: 'State & External Affairs' },
      { id: 'communications', name: 'Communications' },
      { id: 'platform', name: 'Platform/Technical Issues' },
    ];

    res.json({
      success: true,
      data: categories,
    });
  })
);

export default router;
