/**
 * Project Bold Platform - Civic Engagement Routes
 *
 * Implements policies:
 * - P1: Carolina Civic Award
 * - P2: Town-University Partnership Council
 * - P3: Carolina Day of Service
 * - P4: Centralized Service Initiative
 * - P5: Nonpartisan Newsletter
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth, requireSenator } from '../middleware/auth.js';

const router = Router();

// Service hours storage
const serviceHours: Map<string, {
  id: string;
  userId: string;
  hours: number;
  date: string;
  description: string;
  organizationName?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}> = new Map();

/**
 * GET /civic/service-hours
 * Get current user's service hours
 */
router.get(
  '/service-hours',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    const userHours = Array.from(serviceHours.values()).filter(
      h => h.userId === userId
    );

    const totalHours = userHours
      .filter(h => h.status === 'verified')
      .reduce((sum, h) => sum + h.hours, 0);

    const pendingHours = userHours
      .filter(h => h.status === 'pending')
      .reduce((sum, h) => sum + h.hours, 0);

    res.json({
      success: true,
      data: {
        entries: userHours,
        summary: {
          totalVerified: totalHours,
          pendingVerification: pendingHours,
          semesterGoal: req.user!.roles.includes('senator') ? 4 : 0,
          semesterProgress: totalHours,
        },
      },
    });
  })
);

/**
 * POST /civic/service-hours
 * Log service hours
 */
router.post(
  '/service-hours',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { hours, date, description, organizationName } = req.body;

    if (typeof hours !== 'number' || hours <= 0 || hours > 24) {
      throw ApiError.badRequest('Hours must be between 0 and 24');
    }

    const id = `sh-${Date.now()}`;
    const entry = {
      id,
      userId,
      hours,
      date: date || new Date().toISOString().split('T')[0],
      description,
      organizationName,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    serviceHours.set(id, entry);

    res.status(201).json({
      success: true,
      data: entry,
    });
  })
);

/**
 * GET /civic/opportunities
 * List volunteer opportunities
 */
router.get(
  '/opportunities',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const opportunities = [
      {
        id: 'op-1',
        title: 'TABLE Food Pantry Volunteer',
        organization: 'TABLE NC',
        description: 'Help sort and distribute food to families in need.',
        location: 'Carrboro, NC',
        commitment: '2-4 hours/week',
        skills: ['No experience needed'],
        url: 'https://tablenc.org/volunteer',
      },
      {
        id: 'op-2',
        title: 'Habitat for Humanity Build Day',
        organization: 'Habitat for Humanity',
        description: 'Help build affordable homes in Orange County.',
        location: 'Various sites',
        commitment: 'One-time or recurring',
        skills: ['Physical activity', 'No construction experience needed'],
        url: 'https://orangehabitat.org/volunteer',
      },
      {
        id: 'op-3',
        title: 'Chapel Hill-Carrboro Schools Tutoring',
        organization: 'CHCCS',
        description: 'Tutor K-12 students in various subjects.',
        location: 'Local schools',
        commitment: '1-2 hours/week',
        skills: ['Subject knowledge', 'Patience'],
        url: 'https://www.chccs.org/volunteer',
      },
      {
        id: 'op-4',
        title: 'Campus Kitchen Food Recovery',
        organization: 'Campus Kitchen at UNC',
        description: 'Recover unused food from dining halls and deliver to community partners.',
        location: 'UNC Campus',
        commitment: '1-2 hours/shift',
        skills: ['Food handling', 'Driving (optional)'],
        url: '/civic/campus-kitchen',
      },
    ];

    res.json({
      success: true,
      data: opportunities,
    });
  })
);

/**
 * GET /civic/awards
 * Get Carolina Civic Award information
 */
router.get(
  '/awards',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: 'Carolina Civic Award',
        description: 'Annual award recognizing outstanding civic and community engagement.',
        categories: ['Student', 'Faculty', 'Organization'],
        nominationDeadline: '2026-03-15',
        awardCeremony: '2026-04-15',
        nominationUrl: '/civic/awards/nominate',
        pastWinners: [],
      },
    });
  })
);

/**
 * POST /civic/awards/nominate
 * Submit a civic award nomination
 */
router.post(
  '/awards/nominate',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { nomineeEmail, category, description, achievements } = req.body;

    if (!nomineeEmail || !category || !description) {
      throw ApiError.badRequest('Missing required fields');
    }

    if (!['Student', 'Faculty', 'Organization'].includes(category)) {
      throw ApiError.badRequest('Invalid category');
    }

    res.status(201).json({
      success: true,
      data: {
        id: `nom-${Date.now()}`,
        nomineeEmail,
        category,
        description,
        achievements: achievements || [],
        nominatorId: req.user!.sub,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      },
    });
  })
);

/**
 * GET /civic/day-of-service
 * Carolina Day of Service information
 */
router.get(
  '/day-of-service',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: 'Carolina Day of Service',
        date: '2026-04-05',
        description: 'Campus-wide day of service uniting students in community engagement.',
        registrationOpen: true,
        projects: [
          { id: 'proj-1', name: 'Park Cleanup', location: 'Battle Park', spots: 30, spotsRemaining: 15 },
          { id: 'proj-2', name: 'School Supply Drive', location: 'Student Union', spots: 20, spotsRemaining: 8 },
          { id: 'proj-3', name: 'Senior Center Visit', location: 'Carol Woods', spots: 15, spotsRemaining: 15 },
          { id: 'proj-4', name: 'Trail Maintenance', location: 'Carolina North', spots: 25, spotsRemaining: 10 },
        ],
      },
    });
  })
);

export default router;
