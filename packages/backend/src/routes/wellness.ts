/**
 * Project Bold Platform - Wellness & Safety Routes
 *
 * API endpoints for Student Wellness & Safety department.
 * Implements policies:
 * - P1: CAPS Expansion
 * - P2: Off-Campus Safety Task Force
 * - P3: Plan B and Narcan Distribution
 * - P4: Event Safety Planning
 * - P5: Canvas "Student Wellness" Button
 * - P6: ConnectCarolina Health Integration
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth, requireOrgLeader } from '../middleware/auth.js';

const router = Router();

// =============================================================================
// MOCK DATA (Replace with database queries in production)
// =============================================================================

const wellnessResources = [
  {
    id: 'wr-caps-main',
    type: 'caps',
    name: 'CAPS Main Office',
    description: 'Counseling and Psychological Services offers individual and group counseling, crisis intervention, and psychiatric services.',
    location: {
      name: 'James A. Taylor Building',
      address: 'James A. Taylor Bldg, 4th Floor',
      latitude: 35.9067,
      longitude: -79.0483,
    },
    contactPhone: '919-966-3658',
    contactEmail: 'caps@unc.edu',
    websiteUrl: 'https://caps.unc.edu',
    isVirtual: false,
    availability: 'Monday-Friday 8am-5pm, 24/7 crisis line available',
    waitTime: 'Same-day appointments available for urgent needs',
  },
  {
    id: 'wr-caps-crisis',
    type: 'caps',
    name: 'CAPS 24/7 Crisis Line',
    description: 'Immediate support for mental health crises, available any time.',
    contactPhone: '919-966-3658',
    isVirtual: true,
    availability: '24/7',
  },
  {
    id: 'wr-campus-health',
    type: 'health',
    name: 'Campus Health Services',
    description: 'Primary care, immunizations, lab services, pharmacy, and specialty clinics.',
    location: {
      name: 'James A. Taylor Building',
      address: 'James A. Taylor Bldg, Campus Box 7470',
      latitude: 35.9067,
      longitude: -79.0483,
    },
    contactPhone: '919-966-2281',
    websiteUrl: 'https://campushealth.unc.edu',
    isVirtual: false,
    availability: 'Monday-Friday 8am-5pm',
  },
  {
    id: 'wr-safewalk',
    type: 'safety',
    name: 'SafeWalk',
    description: 'Free walking escort service for students on campus at night.',
    contactPhone: '919-962-SAFE',
    isVirtual: false,
    availability: 'Nightly 8pm-2am during fall and spring semesters',
  },
  {
    id: 'wr-narcan-union',
    type: 'narcan',
    name: 'Narcan Distribution - Student Union',
    description: 'Free Narcan (naloxone) kits available to all students. No questions asked.',
    location: {
      name: 'Frank Porter Graham Student Union',
      address: '101 E Franklin St',
      latitude: 35.9108,
      longitude: -79.0520,
    },
    isVirtual: false,
    availability: '24/7 availability at front desk',
    stockStatus: 'available',
  },
  {
    id: 'wr-narcan-campus-health',
    type: 'narcan',
    name: 'Narcan Distribution - Campus Health',
    description: 'Free Narcan with brief training on overdose response.',
    location: {
      name: 'Campus Health Services',
      address: 'James A. Taylor Building',
      latitude: 35.9067,
      longitude: -79.0483,
    },
    isVirtual: false,
    availability: 'Monday-Friday 8am-5pm',
    stockStatus: 'available',
  },
  {
    id: 'wr-plan-b-pharmacy',
    type: 'plan_b',
    name: 'Emergency Contraception - Campus Health Pharmacy',
    description: 'Plan B and other emergency contraception available without prescription.',
    location: {
      name: 'Campus Health Pharmacy',
      address: 'James A. Taylor Building',
      latitude: 35.9067,
      longitude: -79.0483,
    },
    isVirtual: false,
    availability: 'Monday-Friday 8am-5pm',
    stockStatus: 'available',
  },
  {
    id: 'wr-plan-b-cvs',
    type: 'plan_b',
    name: 'Emergency Contraception - CVS Franklin St',
    description: 'Plan B available over-the-counter.',
    location: {
      name: 'CVS Pharmacy',
      address: '137 E Franklin St',
      latitude: 35.9126,
      longitude: -79.0555,
    },
    isVirtual: false,
    availability: 'Open 24 hours',
    stockStatus: 'available',
  },
];

// In-memory safety plans storage
const safetyPlans: Map<string, {
  id: string;
  eventId: string;
  organizationId: string;
  organizationName: string;
  submittedBy: string;
  expectedAttendees: number;
  venueAddress: string;
  transportationPlan: string;
  crowdManagement: string;
  emergencyContacts: { name: string; role: string; phone: string }[];
  alcoholPresent: boolean;
  securityMeasures?: string;
  status: string;
  feedback?: string;
  submittedAt: string;
}> = new Map();

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /wellness/resources
 * List all wellness resources with optional filtering
 */
router.get(
  '/resources',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;

    let resources = wellnessResources;

    if (type && typeof type === 'string') {
      resources = resources.filter(r => r.type === type);
    }

    res.json({
      success: true,
      data: resources,
    });
  })
);

/**
 * GET /wellness/resources/:id
 * Get single wellness resource
 */
router.get(
  '/resources/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const resource = wellnessResources.find(r => r.id === id);

    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    res.json({
      success: true,
      data: resource,
    });
  })
);

/**
 * GET /wellness/distribution
 * Get Plan B and Narcan distribution locations
 */
router.get(
  '/distribution',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;

    let locations = wellnessResources.filter(
      r => r.type === 'plan_b' || r.type === 'narcan'
    );

    if (type === 'plan_b') {
      locations = wellnessResources.filter(r => r.type === 'plan_b');
    } else if (type === 'narcan') {
      locations = wellnessResources.filter(r => r.type === 'narcan');
    }

    res.json({
      success: true,
      data: locations,
    });
  })
);

/**
 * GET /wellness/safety-plans
 * List safety plans for org leaders (own org) or admins (all)
 */
router.get(
  '/safety-plans',
  authenticateToken,
  requireOrgLeader,
  asyncHandler(async (req: Request, res: Response) => {
    const plans = Array.from(safetyPlans.values());

    // Filter by organization if not admin
    const userPlans = req.user!.roles.includes('admin')
      ? plans
      : plans.filter(p => p.submittedBy === req.user!.sub);

    res.json({
      success: true,
      data: userPlans,
    });
  })
);

/**
 * POST /wellness/safety-plans
 * Submit a new event safety plan
 */
router.post(
  '/safety-plans',
  authenticateToken,
  requireOrgLeader,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      eventId,
      organizationId,
      organizationName,
      expectedAttendees,
      venueAddress,
      transportationPlan,
      crowdManagement,
      emergencyContacts,
      alcoholPresent,
      securityMeasures,
    } = req.body;

    // Validate required fields
    if (!eventId || !organizationId || !venueAddress || !transportationPlan || !crowdManagement || !emergencyContacts) {
      throw ApiError.badRequest('Missing required fields');
    }

    if (!Array.isArray(emergencyContacts) || emergencyContacts.length === 0) {
      throw ApiError.badRequest('At least one emergency contact is required');
    }

    const id = `sp-${Date.now()}`;

    const plan = {
      id,
      eventId,
      organizationId,
      organizationName: organizationName || 'Unknown Organization',
      submittedBy: req.user!.sub,
      expectedAttendees: expectedAttendees || 0,
      venueAddress,
      transportationPlan,
      crowdManagement,
      emergencyContacts,
      alcoholPresent: alcoholPresent || false,
      securityMeasures,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    safetyPlans.set(id, plan);

    res.status(201).json({
      success: true,
      data: plan,
    });
  })
);

/**
 * GET /wellness/safety-plans/:id
 * Get a specific safety plan
 */
router.get(
  '/safety-plans/:id',
  authenticateToken,
  requireOrgLeader,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const plan = safetyPlans.get(id);

    if (!plan) {
      throw ApiError.notFound('Safety plan not found');
    }

    // Check ownership unless admin
    if (!req.user!.roles.includes('admin') && plan.submittedBy !== req.user!.sub) {
      throw ApiError.forbidden('You can only view your own safety plans');
    }

    res.json({
      success: true,
      data: plan,
    });
  })
);

/**
 * GET /wellness/canvas-button-config
 * Configuration for Canvas LTI "Student Wellness" button
 */
router.get(
  '/canvas-button-config',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        buttonText: 'Student Wellness',
        buttonIcon: 'heart',
        targetUrl: '/wellness',
        description: 'Access mental health, medical, and safety resources',
        categories: [
          {
            id: 'mental-health',
            name: 'Mental Health',
            description: 'CAPS, counseling, and crisis support',
            icon: 'brain',
            resourceTypes: ['caps'],
          },
          {
            id: 'medical',
            name: 'Medical Services',
            description: 'Campus Health, pharmacy, and appointments',
            icon: 'stethoscope',
            resourceTypes: ['health'],
          },
          {
            id: 'safety',
            name: 'Safety',
            description: 'SafeWalk, emergency services, and ride programs',
            icon: 'shield',
            resourceTypes: ['safety'],
          },
          {
            id: 'harm-reduction',
            name: 'Harm Reduction',
            description: 'Plan B, Narcan, and overdose prevention',
            icon: 'first-aid',
            resourceTypes: ['plan_b', 'narcan'],
          },
        ],
      },
    });
  })
);

/**
 * GET /wellness/quick-links
 * Get quick action links for wellness dashboard
 */
router.get(
  '/quick-links',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [
        {
          id: 'caps-appointment',
          title: 'Schedule CAPS Appointment',
          description: 'Book a counseling session',
          url: 'https://caps.unc.edu/appointments',
          icon: 'calendar',
          priority: 1,
        },
        {
          id: 'crisis-line',
          title: 'Crisis Support (24/7)',
          description: '919-966-3658',
          url: 'tel:919-966-3658',
          icon: 'phone',
          priority: 2,
          isEmergency: true,
        },
        {
          id: 'health-portal',
          title: 'Patient Portal',
          description: 'View records and messages',
          url: 'https://campushealth.unc.edu/patient-portal',
          icon: 'folder',
          priority: 3,
        },
        {
          id: 'safewalk',
          title: 'Request SafeWalk',
          description: '919-962-SAFE',
          url: 'tel:919-962-7233',
          icon: 'walk',
          priority: 4,
        },
      ],
    });
  })
);

export default router;
