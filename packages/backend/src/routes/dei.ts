/**
 * Project Bold Platform - DEI Routes
 *
 * Implements policies:
 * - P1: Student Success Syllabi Section
 * - P2: Cultural Organizations Council
 * - P3: University-Wide Cultural Calendar
 * - P4: Collaborative Cultural Programming Fund
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth, requireOrgLeader } from '../middleware/auth.js';

const router = Router();

// Mock cultural events
const culturalEvents = [
  {
    id: 'ce-1',
    title: 'Black History Month Kickoff',
    description: 'Opening celebration featuring student performances and keynote speaker.',
    organizationId: 'org-bsa',
    organizationName: 'Black Student Movement',
    type: 'celebration',
    heritageMonth: 'Black History Month',
    startDate: '2026-02-01T18:00:00',
    endDate: '2026-02-01T21:00:00',
    location: { name: 'Memorial Hall' },
    isPublic: true,
    rsvpRequired: true,
    maxAttendees: 500,
  },
  {
    id: 'ce-2',
    title: 'Lunar New Year Festival',
    description: 'Celebrate the Year of the Horse with food, performances, and activities.',
    organizationId: 'org-casa',
    organizationName: 'Carolina Asia Student Association',
    type: 'celebration',
    heritageMonth: 'Asian Pacific American Heritage',
    startDate: '2026-01-29T17:00:00',
    endDate: '2026-01-29T21:00:00',
    location: { name: 'Great Hall' },
    isPublic: true,
    rsvpRequired: false,
  },
  {
    id: 'ce-3',
    title: 'Latinx Heritage Month Art Exhibition',
    description: 'Student art celebrating Latinx culture and identity.',
    organizationId: 'org-mcha',
    organizationName: 'Mi Comunidad Hispana Americana',
    type: 'performance',
    heritageMonth: 'Hispanic Heritage Month',
    startDate: '2026-09-15T12:00:00',
    endDate: '2026-10-15T17:00:00',
    location: { name: 'Student Union Gallery' },
    isPublic: true,
    rsvpRequired: false,
  },
];

// Mock cultural organizations
const culturalOrganizations = [
  {
    id: 'org-bsa',
    name: 'Black Student Movement',
    description: 'The official voice of Black students at UNC.',
    categories: ['African American', 'Cultural'],
    contactEmail: 'bsm@unc.edu',
    websiteUrl: 'https://bsm.unc.edu',
    memberCount: 500,
  },
  {
    id: 'org-casa',
    name: 'Carolina Asia Student Association',
    description: 'Promoting Asian and Asian American culture and community.',
    categories: ['Asian American', 'Cultural'],
    contactEmail: 'casa@unc.edu',
    memberCount: 300,
  },
  {
    id: 'org-mcha',
    name: 'Mi Comunidad Hispana Americana',
    description: 'Supporting and celebrating Latinx students.',
    categories: ['Hispanic/Latinx', 'Cultural'],
    contactEmail: 'mcha@unc.edu',
    memberCount: 250,
  },
  {
    id: 'org-nasa',
    name: 'Native American Student Association',
    description: 'Representing Native American students and preserving indigenous culture.',
    categories: ['Native American', 'Cultural'],
    contactEmail: 'nasa@unc.edu',
    memberCount: 75,
  },
];

/**
 * GET /dei/cultural-calendar
 * List cultural events
 */
router.get(
  '/cultural-calendar',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { month, type, organization } = req.query;

    let events = culturalEvents;

    if (month && typeof month === 'string') {
      events = events.filter(e => e.heritageMonth?.toLowerCase().includes(month.toLowerCase()));
    }

    if (type && typeof type === 'string') {
      events = events.filter(e => e.type === type);
    }

    if (organization && typeof organization === 'string') {
      events = events.filter(e => e.organizationId === organization);
    }

    res.json({
      success: true,
      data: events,
    });
  })
);

/**
 * GET /dei/organizations
 * List cultural organizations
 */
router.get(
  '/organizations',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: culturalOrganizations,
    });
  })
);

/**
 * GET /dei/organizations/:id
 * Get single cultural organization
 */
router.get(
  '/organizations/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const org = culturalOrganizations.find(o => o.id === id);

    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    // Get organization's events
    const events = culturalEvents.filter(e => e.organizationId === id);

    res.json({
      success: true,
      data: {
        ...org,
        upcomingEvents: events,
      },
    });
  })
);

/**
 * GET /dei/heritage-months
 * List heritage months and celebrations
 */
router.get(
  '/heritage-months',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const heritageMonths = [
      { month: 'February', name: 'Black History Month' },
      { month: 'March', name: "Women's History Month" },
      { month: 'April', name: 'Arab American Heritage Month' },
      { month: 'May', name: 'Asian Pacific American Heritage Month' },
      { month: 'June', name: 'Pride Month' },
      { month: 'September-October', name: 'Hispanic Heritage Month (Sept 15 - Oct 15)' },
      { month: 'October', name: 'Disability Awareness Month' },
      { month: 'November', name: 'Native American Heritage Month' },
    ];

    res.json({
      success: true,
      data: heritageMonths,
    });
  })
);

/**
 * POST /dei/funding
 * Submit cultural programming fund application
 */
router.post(
  '/funding',
  authenticateToken,
  requireOrgLeader,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      organizationIds,
      title,
      description,
      requestedAmount,
      eventDate,
      expectedAttendees,
      budgetBreakdown,
    } = req.body;

    if (!title || !description || !requestedAmount || !eventDate || !budgetBreakdown) {
      throw ApiError.badRequest('Missing required fields');
    }

    const application = {
      id: `fund-${Date.now()}`,
      organizationIds: organizationIds || [],
      title,
      description,
      requestedAmount,
      eventDate,
      expectedAttendees: expectedAttendees || 0,
      budgetBreakdown,
      status: 'submitted',
      submittedBy: req.user!.sub,
      submittedAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: application,
    });
  })
);

/**
 * GET /dei/syllabi-template
 * Get recommended syllabi section template
 */
router.get(
  '/syllabi-template',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        title: 'Student Success & Engagement Resources',
        description: 'Recommended section for course syllabi highlighting campus resources.',
        template: `## Student Success & Engagement

UNC offers many resources to support your success:

**Academic Support**
- Writing Center: writingcenter.unc.edu
- Learning Center: learningcenter.unc.edu
- Peer Tutoring: Available through your department

**Wellness & Mental Health**
- CAPS (Counseling): caps.unc.edu | 919-966-3658
- Campus Health: campushealth.unc.edu

**Leadership & Engagement**
- Student Government: sg.unc.edu
- Campus Y: campusy.unc.edu
- Carolina Center for Public Service: ccps.unc.edu

**Identity & Belonging**
- Cultural organizations and affinity groups
- Multicultural Affairs: diversity.unc.edu

I encourage you to explore these resources and engage with the Carolina community.`,
        adoptionGuide: 'https://projectbold.unc.edu/syllabi-guide',
      },
    });
  })
);

export default router;
