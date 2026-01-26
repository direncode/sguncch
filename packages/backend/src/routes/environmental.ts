/**
 * Project Bold Platform - Environmental Affairs Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /environmental/events
 * Sustainability events including Sustain Carolina Week
 */
router.get(
  '/events',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const events = [
      {
        id: 'se-1',
        title: 'Sustain Carolina Week 2026',
        description: 'A week-long celebration of sustainability at UNC.',
        startDate: '2026-04-13',
        endDate: '2026-04-19',
        events: [
          { day: 'Monday', title: 'Zero-Waste Challenge Kickoff', time: '12:00', location: 'The Pit' },
          { day: 'Tuesday', title: 'Sustainable Fashion Swap', time: '14:00', location: 'Student Union' },
          { day: 'Wednesday', title: 'Environmental Careers Panel', time: '17:00', location: 'Carroll Hall' },
          { day: 'Thursday', title: 'Campus Cleanup Day', time: '10:00', location: 'Meet at Bell Tower' },
          { day: 'Friday', title: 'Local Food Festival', time: '11:00', location: 'The Pit' },
        ],
      },
    ];

    res.json({ success: true, data: events });
  })
);

/**
 * GET /environmental/surplus-meals
 * Too Good To Go meal availability
 */
router.get(
  '/surplus-meals',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const meals = [
      {
        id: 'sm-1',
        diningLocation: 'Lenoir Hall',
        description: 'Surprise bag with hot entrees and sides',
        originalPrice: 12.00,
        discountedPrice: 4.00,
        availableFrom: '20:30',
        availableUntil: '21:00',
        quantity: 15,
        claimedCount: 8,
      },
      {
        id: 'sm-2',
        diningLocation: 'Chase Dining Hall',
        description: 'Surprise bag with salads and fresh items',
        originalPrice: 10.00,
        discountedPrice: 3.50,
        availableFrom: '20:00',
        availableUntil: '20:30',
        quantity: 10,
        claimedCount: 10,
      },
    ];

    res.json({ success: true, data: meals });
  })
);

/**
 * GET /environmental/adopted-spaces
 * Adopt-a-Space program
 */
router.get(
  '/adopted-spaces',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const spaces = [
      {
        id: 'as-1',
        spaceName: 'Polk Place South',
        organizationName: 'Environmental Affairs Committee',
        nextCleanupDate: '2026-02-15',
        cleanupCount: 12,
      },
      {
        id: 'as-2',
        spaceName: 'Coker Arboretum Path',
        organizationName: 'Carolina Environmental Student Alliance',
        nextCleanupDate: '2026-02-22',
        cleanupCount: 8,
      },
    ];

    res.json({ success: true, data: spaces });
  })
);

/**
 * GET /environmental/donations
 * Move-out donation shop items
 */
router.get(
  '/donations',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const items = [
      {
        id: 'di-1',
        category: 'furniture',
        title: 'Desk Lamp',
        description: 'LED desk lamp, good condition',
        condition: 'good',
        price: 5.00,
        status: 'available',
      },
      {
        id: 'di-2',
        category: 'supplies',
        title: 'Storage Bins (Set of 3)',
        description: 'Clear plastic bins, various sizes',
        condition: 'excellent',
        price: 8.00,
        status: 'available',
      },
    ];

    res.json({ success: true, data: items });
  })
);

/**
 * GET /environmental/composting-stations
 * Composting station locations
 */
router.get(
  '/composting-stations',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const stations = [
      { id: 'cs-1', name: 'Lenoir Hall Composting', location: 'Lenoir Dining Hall', hasEducationalSignage: true },
      { id: 'cs-2', name: 'Chase Hall Composting', location: 'Chase Dining Hall', hasEducationalSignage: true },
      { id: 'cs-3', name: 'Student Union Composting', location: 'Student Union Food Court', hasEducationalSignage: true },
    ];

    res.json({ success: true, data: stations });
  })
);

export default router;
