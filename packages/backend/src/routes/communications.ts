/**
 * Project Bold Platform - Communications Routes
 *
 * Implements initiatives:
 * - I1: "Who is Carolina" Campaign
 * - I2: Student Advisory Committee
 * - I3: Student Government Podcast
 * - I4-5: Social Media Spotlights
 * - I6: Accountability Dashboard
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth, requireCabinet } from '../middleware/auth.js';
import { DEPARTMENTS, POLICIES, Department, Policy } from '../types/index.js';

const router = Router();

/**
 * GET /communications/stories
 * "Who is Carolina" story submissions
 */
router.get(
  '/stories',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const stories = [
      {
        id: 'story-1',
        title: 'Finding Community Through Service',
        userName: 'Maria G.',
        major: 'Public Health',
        thumbnailUrl: '/images/stories/maria.jpg',
        videoUrl: '/videos/stories/maria.mp4',
        status: 'published',
        publishedAt: '2026-01-15',
        viewCount: 1250,
      },
      {
        id: 'story-2',
        title: 'From First-Gen to Future Leader',
        userName: 'James T.',
        major: 'Political Science',
        thumbnailUrl: '/images/stories/james.jpg',
        videoUrl: '/videos/stories/james.mp4',
        status: 'published',
        publishedAt: '2026-01-10',
        viewCount: 980,
      },
    ];

    res.json({ success: true, data: stories });
  })
);

/**
 * POST /communications/stories
 * Submit a story for "Who is Carolina"
 */
router.post(
  '/stories',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, story } = req.body;

    if (!title || !story) {
      throw ApiError.badRequest('Title and story are required');
    }

    const submission = {
      id: `story-${Date.now()}`,
      userId: req.user!.sub,
      title,
      story,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, data: submission });
  })
);

/**
 * GET /communications/podcast
 * Student Government Podcast episodes
 */
router.get(
  '/podcast',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const episodes = [
      {
        id: 'ep-1',
        episodeNumber: 1,
        title: 'Welcome to Project Bold',
        description: 'Introducing the vision and goals for Student Government this year.',
        guestName: 'Devin Duncan',
        guestTitle: 'Student Body President',
        audioUrl: '/podcast/ep1.mp3',
        duration: 2400,
        publishedAt: '2026-01-20',
        topics: ['Introduction', 'Vision', 'Goals'],
      },
      {
        id: 'ep-2',
        episodeNumber: 2,
        title: 'Building Community at Carolina',
        description: 'A conversation about fostering belonging and connection on campus.',
        guestName: 'Student Panel',
        audioUrl: '/podcast/ep2.mp3',
        duration: 2700,
        publishedAt: '2026-02-03',
        topics: ['Community', 'Belonging', 'Student Life'],
      },
    ];

    res.json({ success: true, data: episodes });
  })
);

/**
 * GET /communications/metrics
 * Accountability dashboard metrics
 */
router.get(
  '/metrics',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // Calculate overall policy progress
    const totalPolicies = Object.keys(POLICIES).length;
    const departmentStats = Object.values(DEPARTMENTS).map((dept: Department) => {
      const deptPolicies = Object.values(POLICIES).filter((p: Policy) => p.departmentId === dept.id);
      return {
        department: dept.name,
        slug: dept.slug,
        color: dept.color,
        policyCount: deptPolicies.length,
        // In production, pull from database
        completedCount: 0,
        inProgressCount: 0,
        averageProgress: 0,
      };
    });

    const metrics = {
      overview: {
        totalPolicies,
        completedPolicies: 0,
        inProgressPolicies: 0,
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      },
      byDepartment: departmentStats,
      keyMetrics: [
        {
          name: 'Peer Mentorship Matches',
          current: 0,
          target: 500,
          unit: 'pairs',
          department: 'Academic Affairs',
        },
        {
          name: 'Service Hours Logged',
          current: 0,
          target: 10000,
          unit: 'hours',
          department: 'Civic Engagement',
        },
        {
          name: 'Wellness Resource Views',
          current: 0,
          target: 5000,
          unit: 'views',
          department: 'Wellness & Safety',
        },
        {
          name: 'Cultural Events Hosted',
          current: 0,
          target: 50,
          unit: 'events',
          department: 'DEI',
        },
      ],
    };

    res.json({ success: true, data: metrics });
  })
);

/**
 * GET /communications/announcements
 * Get announcements
 */
router.get(
  '/announcements',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const announcements = [
      {
        id: 'ann-1',
        title: 'Welcome to Project Bold Platform',
        content: 'We are excited to launch the Project Bold Policy Platform, your hub for tracking Student Government initiatives and accessing campus resources.',
        priority: 'high',
        publishedAt: '2026-01-15',
        isPinned: true,
      },
      {
        id: 'ann-2',
        title: 'Peer Mentorship Program Now Open',
        content: 'Sign up to be a mentor or find a mentor through our new matching system.',
        priority: 'normal',
        publishedAt: '2026-01-20',
        isPinned: false,
      },
    ];

    res.json({ success: true, data: announcements });
  })
);

/**
 * POST /communications/announcements
 * Create announcement (cabinet only)
 */
router.post(
  '/announcements',
  authenticateToken,
  requireCabinet,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, priority, departmentId } = req.body;

    if (!title || !content) {
      throw ApiError.badRequest('Title and content are required');
    }

    const announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      priority: priority || 'normal',
      departmentId,
      authorId: req.user!.sub,
      publishedAt: new Date().toISOString(),
      isPinned: false,
    };

    res.status(201).json({ success: true, data: announcement });
  })
);

export default router;
