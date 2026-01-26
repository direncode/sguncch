/**
 * Project Bold Platform - Basic Needs Routes
 *
 * Implements policies:
 * - P1: Farmers Markets and Chase Farm Stands
 * - P2: Centralized Food Security Hub
 * - P3: Plus Swipe Expansion
 * - P4: Grocery Transportation
 * - P5: Off-Campus Living Education
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Mock food resources
const foodResources = [
  {
    id: 'fr-pantry-union',
    type: 'pantry',
    name: 'Carolina Cupboard',
    description: 'Free food pantry for students, stocked with non-perishables and fresh items.',
    location: { name: 'Student Union', room: 'Room 2510' },
    schedule: { monday: { open: '10:00', close: '16:00' }, wednesday: { open: '10:00', close: '16:00' }, friday: { open: '10:00', close: '16:00' } },
  },
  {
    id: 'fr-fridge-davis',
    type: 'fridge',
    name: 'Community Fridge - Davis Library',
    description: 'Free community fridge with fresh produce and prepared meals.',
    location: { name: 'Davis Library', room: 'First Floor' },
    schedule: { specialNotes: '24/7 access' },
  },
  {
    id: 'fr-market-pit',
    type: 'farmers_market',
    name: 'Pit Farmers Market',
    description: 'Weekly farmers market in the Pit with local produce.',
    location: { name: 'The Pit' },
    schedule: { wednesday: { open: '11:00', close: '14:00' } },
  },
  {
    id: 'fr-farm-stand',
    type: 'farm_stand',
    name: 'Chase Farm Stand',
    description: 'Fresh produce from Chase Farm, available weekly.',
    location: { name: 'Chase Hall Lobby' },
    schedule: { thursday: { open: '12:00', close: '17:00' } },
  },
];

// Mock grocery shuttle
const groceryShuttle = {
  id: 'gs-1',
  routeName: 'Grocery Express',
  stops: [
    { name: 'Student Union', arrivalTime: '14:00', departureTime: '14:05' },
    { name: 'South Campus', arrivalTime: '14:15', departureTime: '14:20' },
    { name: 'Harris Teeter', arrivalTime: '14:35', departureTime: '15:30' },
    { name: 'South Campus', arrivalTime: '15:45', departureTime: '15:50' },
    { name: 'Student Union', arrivalTime: '16:00', departureTime: null },
  ],
  schedule: [
    { dayOfWeek: 0, departureTime: '14:00', returnTime: '16:00' }, // Sunday
    { dayOfWeek: 6, departureTime: '11:00', returnTime: '13:00' }, // Saturday
  ],
  isActive: true,
};

/**
 * GET /basic-needs/food-resources
 * List all food resources
 */
router.get(
  '/food-resources',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;

    let resources = foodResources;
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
 * GET /basic-needs/grocery-shuttle
 * Get grocery shuttle schedule
 */
router.get(
  '/grocery-shuttle',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: groceryShuttle,
    });
  })
);

/**
 * GET /basic-needs/plus-swipe-vendors
 * List Plus Swipe eligible vendors
 */
router.get(
  '/plus-swipe-vendors',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const vendors = [
      { id: 'v-1', name: 'Top of Lenoir', location: 'Lenoir Hall', category: 'dining_hall', acceptsPlusSwipe: true },
      { id: 'v-2', name: 'Chase Dining Hall', location: 'Chase Hall', category: 'dining_hall', acceptsPlusSwipe: true },
      { id: 'v-3', name: 'Alpine Bagel', location: 'Student Union', category: 'cafe', acceptsPlusSwipe: true },
      { id: 'v-4', name: 'Starbucks', location: 'Student Union', category: 'cafe', acceptsPlusSwipe: true },
      { id: 'v-5', name: 'Subway', location: 'Student Union', category: 'fast_food', acceptsPlusSwipe: true },
    ];

    res.json({
      success: true,
      data: vendors,
    });
  })
);

/**
 * GET /basic-needs/workshops
 * Off-campus living education workshops
 */
router.get(
  '/workshops',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const workshops = [
      {
        id: 'ws-1',
        title: 'Understanding Your Lease',
        description: 'Learn the ins and outs of lease agreements before signing.',
        date: '2026-02-15',
        time: '17:00',
        location: 'Student Union 3201',
        registrationUrl: '/events/ws-1/register',
      },
      {
        id: 'ws-2',
        title: 'Budgeting 101 for Off-Campus Living',
        description: 'Creating a realistic budget for rent, utilities, and groceries.',
        date: '2026-02-22',
        time: '17:00',
        location: 'Student Union 3201',
        registrationUrl: '/events/ws-2/register',
      },
      {
        id: 'ws-3',
        title: 'Finding Roommates and Housing',
        description: 'Tips for finding compatible roommates and navigating the rental market.',
        date: '2026-03-01',
        time: '17:00',
        location: 'Student Union 3201',
        registrationUrl: '/events/ws-3/register',
      },
    ];

    res.json({
      success: true,
      data: workshops,
    });
  })
);

export default router;
