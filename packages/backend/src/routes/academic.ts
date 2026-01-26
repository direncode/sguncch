/**
 * Project Bold Platform - Academic Affairs Routes
 *
 * API endpoints for Academic Affairs department.
 * Implements policies:
 * - P1: University-Wide Peer Mentorship Network
 * - P2: Midterm Progress Check-Ins
 * - P3: STEM Collaboration Centers
 * - P4: Dean's List Enhancement
 * - P5: First-Year Strengths Integration
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import { config } from '../config/index.js';

const router = Router();

// =============================================================================
// MOCK DATA (Replace with database in production)
// =============================================================================

// Mentorship requests storage
const mentorshipRequests: Map<string, {
  id: string;
  userId: string;
  role: 'mentor' | 'mentee';
  disciplines: string[];
  topics: string[];
  availability: string[];
  goals: string;
  preferences: {
    sameCollege: boolean;
    sameMajor: boolean;
    similarInterests: boolean;
    communicationStyle: 'frequent' | 'moderate' | 'occasional';
  };
  isActive: boolean;
  createdAt: string;
}> = new Map();

// Mentorship matches storage
const mentorshipMatches: Map<string, {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  matchScore: number;
  matchReason: string;
  discipline: string;
  createdAt: string;
}> = new Map();

// STEM Centers
const stemCenters = [
  {
    id: 'stem-chapman',
    name: 'Chapman Hall Study Center',
    location: 'Chapman Hall, Room 125',
    disciplines: ['Chemistry', 'Biology', 'Biochemistry'],
    amenities: ['Whiteboards', 'Group tables', 'Tutoring available'],
    is24Hour: false,
    capacity: 40,
    hours: 'Sunday-Thursday 7pm-12am',
  },
  {
    id: 'stem-phillips',
    name: 'Phillips Hall Math Center',
    location: 'Phillips Hall, Room 381',
    disciplines: ['Mathematics', 'Statistics', 'Applied Math'],
    amenities: ['Computer stations', 'Drop-in tutoring', 'Study rooms'],
    is24Hour: false,
    capacity: 30,
    hours: 'Monday-Thursday 4pm-10pm, Sunday 2pm-8pm',
  },
  {
    id: 'stem-sitterson',
    name: 'Sitterson Computer Science Lab',
    location: 'Sitterson Hall, Room 014',
    disciplines: ['Computer Science', 'Information Science'],
    amenities: ['Linux workstations', 'Printing', 'TA office hours'],
    is24Hour: true,
    capacity: 50,
    hours: '24/7 with valid Onyen',
  },
  {
    id: 'stem-venable',
    name: 'Venable Hall Physics Center',
    location: 'Venable Hall, Room 108',
    disciplines: ['Physics', 'Astronomy'],
    amenities: ['Lab equipment demos', 'Study groups', 'Peer tutoring'],
    is24Hour: false,
    capacity: 25,
    hours: 'Monday-Friday 3pm-9pm',
  },
];

// =============================================================================
// PEER MENTORSHIP ROUTES (Policy #1)
// =============================================================================

/**
 * GET /academic/mentorship
 * Get current user's mentorship info
 */
router.get(
  '/mentorship',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    // Find user's request
    const request = Array.from(mentorshipRequests.values()).find(
      r => r.userId === userId && r.isActive
    );

    // Find user's matches
    const matches = Array.from(mentorshipMatches.values()).filter(
      m => m.mentorId === userId || m.menteeId === userId
    );

    res.json({
      success: true,
      data: {
        request,
        matches,
      },
    });
  })
);

/**
 * POST /academic/mentorship/request
 * Submit a mentorship request (as mentor or mentee)
 */
router.post(
  '/mentorship/request',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const {
      role,
      disciplines,
      topics,
      availability,
      goals,
      preferences,
    } = req.body;

    // Validate role
    if (!['mentor', 'mentee'].includes(role)) {
      throw ApiError.badRequest('Role must be "mentor" or "mentee"');
    }

    // Check for existing active request
    const existingRequest = Array.from(mentorshipRequests.values()).find(
      r => r.userId === userId && r.isActive
    );

    if (existingRequest) {
      throw ApiError.conflict('You already have an active mentorship request');
    }

    const id = `mr-${Date.now()}`;
    const request = {
      id,
      userId,
      role,
      disciplines: disciplines || [],
      topics: topics || [],
      availability: availability || [],
      goals: goals || '',
      preferences: {
        sameCollege: preferences?.sameCollege ?? false,
        sameMajor: preferences?.sameMajor ?? false,
        similarInterests: preferences?.similarInterests ?? true,
        communicationStyle: preferences?.communicationStyle ?? 'moderate',
      },
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mentorshipRequests.set(id, request);

    res.status(201).json({
      success: true,
      data: request,
    });
  })
);

/**
 * POST /academic/mentorship/match
 * AI-powered matching (if enabled)
 */
router.post(
  '/mentorship/match',
  authenticateToken,
  aiRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    // Find user's request
    const userRequest = Array.from(mentorshipRequests.values()).find(
      r => r.userId === userId && r.isActive
    );

    if (!userRequest) {
      throw ApiError.badRequest('You must submit a mentorship request first');
    }

    // Find potential matches (opposite role)
    const oppositeRole = userRequest.role === 'mentor' ? 'mentee' : 'mentor';
    const potentialMatches = Array.from(mentorshipRequests.values()).filter(
      r => r.role === oppositeRole && r.isActive && r.userId !== userId
    );

    if (potentialMatches.length === 0) {
      res.json({
        success: true,
        data: {
          matches: [],
          message: 'No potential matches found at this time. Check back later!',
        },
      });
      return;
    }

    // Simple scoring algorithm (replace with AI in production)
    const scoredMatches = potentialMatches.map(match => {
      let score = 0;
      let reasons: string[] = [];

      // Discipline overlap
      const disciplineOverlap = match.disciplines.filter(d =>
        userRequest.disciplines.includes(d)
      );
      if (disciplineOverlap.length > 0) {
        score += disciplineOverlap.length * 20;
        reasons.push(`Shared disciplines: ${disciplineOverlap.join(', ')}`);
      }

      // Topic overlap
      const topicOverlap = match.topics.filter(t => userRequest.topics.includes(t));
      if (topicOverlap.length > 0) {
        score += topicOverlap.length * 15;
        reasons.push(`Common topics: ${topicOverlap.join(', ')}`);
      }

      // Availability overlap
      const availOverlap = match.availability.filter(a =>
        userRequest.availability.includes(a)
      );
      if (availOverlap.length > 0) {
        score += availOverlap.length * 10;
        reasons.push('Compatible schedules');
      }

      // Communication style match
      if (match.preferences.communicationStyle === userRequest.preferences.communicationStyle) {
        score += 15;
        reasons.push('Matching communication preferences');
      }

      return {
        requestId: match.id,
        userId: match.userId,
        score: Math.min(score, 100),
        matchReason: reasons.join('. '),
        disciplines: disciplineOverlap,
      };
    });

    // Sort by score and return top matches
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        matches: topMatches,
        aiEnabled: config.ai.matchingEnabled,
      },
    });
  })
);

/**
 * POST /academic/mentorship/accept/:matchId
 * Accept a suggested match
 */
router.post(
  '/mentorship/accept/:requestId',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { requestId } = req.params;

    // Find user's request
    const userRequest = Array.from(mentorshipRequests.values()).find(
      r => r.userId === userId && r.isActive
    );

    if (!userRequest) {
      throw ApiError.badRequest('You must have an active mentorship request');
    }

    // Find the other user's request
    const otherRequest = mentorshipRequests.get(requestId);

    if (!otherRequest || !otherRequest.isActive) {
      throw ApiError.notFound('Mentorship request not found or no longer active');
    }

    // Create match
    const matchId = `mm-${Date.now()}`;
    const isMentor = userRequest.role === 'mentor';

    const match = {
      id: matchId,
      mentorId: isMentor ? userId : otherRequest.userId,
      menteeId: isMentor ? otherRequest.userId : userId,
      status: 'pending' as const,
      matchScore: 85, // Would come from AI scoring
      matchReason: 'Match accepted by user',
      discipline: userRequest.disciplines[0] || 'General',
      createdAt: new Date().toISOString(),
    };

    mentorshipMatches.set(matchId, match);

    // Deactivate requests
    userRequest.isActive = false;
    otherRequest.isActive = false;

    res.json({
      success: true,
      data: match,
    });
  })
);

// =============================================================================
// STEM CENTERS ROUTES (Policy #3)
// =============================================================================

/**
 * GET /academic/stem-centers
 * List all STEM centers
 */
router.get(
  '/stem-centers',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { discipline, is24Hour } = req.query;

    let centers = stemCenters;

    if (discipline && typeof discipline === 'string') {
      centers = centers.filter(c =>
        c.disciplines.some(d => d.toLowerCase().includes(discipline.toLowerCase()))
      );
    }

    if (is24Hour === 'true') {
      centers = centers.filter(c => c.is24Hour);
    }

    res.json({
      success: true,
      data: centers,
    });
  })
);

/**
 * GET /academic/stem-centers/:id
 * Get single STEM center details
 */
router.get(
  '/stem-centers/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const center = stemCenters.find(c => c.id === id);

    if (!center) {
      throw ApiError.notFound('STEM center not found');
    }

    res.json({
      success: true,
      data: center,
    });
  })
);

// =============================================================================
// GALLUP STRENGTHS ROUTES (Policy #5)
// =============================================================================

// Gallup strengths storage
const userStrengths: Map<string, {
  userId: string;
  assessmentDate: string;
  topFive: string[];
}> = new Map();

/**
 * GET /academic/strengths
 * Get current user's Gallup strengths
 */
router.get(
  '/strengths',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const strengths = userStrengths.get(userId);

    if (!strengths) {
      res.json({
        success: true,
        data: null,
        message: 'No strengths assessment on file. Complete your Gallup Strengths assessment to see results here.',
      });
      return;
    }

    res.json({
      success: true,
      data: strengths,
    });
  })
);

/**
 * POST /academic/strengths
 * Record Gallup strengths results
 */
router.post(
  '/strengths',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { topFive } = req.body;

    if (!Array.isArray(topFive) || topFive.length !== 5) {
      throw ApiError.badRequest('Must provide exactly 5 top strengths');
    }

    const strengths = {
      userId,
      assessmentDate: new Date().toISOString(),
      topFive,
    };

    userStrengths.set(userId, strengths);

    res.json({
      success: true,
      data: strengths,
    });
  })
);

/**
 * GET /academic/disciplines
 * List available academic disciplines for mentorship
 */
router.get(
  '/disciplines',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const disciplines = [
      'Computer Science',
      'Biology',
      'Chemistry',
      'Physics',
      'Mathematics',
      'Statistics',
      'Economics',
      'Political Science',
      'Psychology',
      'English',
      'History',
      'Public Policy',
      'Business',
      'Communications',
      'Journalism',
      'Pre-Med',
      'Pre-Law',
      'Engineering',
      'Environmental Science',
      'Public Health',
    ];

    res.json({
      success: true,
      data: disciplines,
    });
  })
);

export default router;
