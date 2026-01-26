/**
 * Project Bold Platform - Events Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Mock events storage
const events: Map<string, {
  id: string;
  title: string;
  description: string;
  type: string;
  departmentId?: string;
  organizationId?: string;
  location: { name: string; address?: string };
  startTime: string;
  endTime: string;
  isPublic: boolean;
  rsvpRequired: boolean;
  maxAttendees?: number;
  tags: string[];
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
}> = new Map();

// Mock RSVPs
const rsvps: Map<string, { eventId: string; userId: string; status: string; registeredAt: string }[]> = new Map();

/**
 * GET /events
 * List events with filtering
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { department, type, upcoming } = req.query;

    let eventList = Array.from(events.values());

    if (department && typeof department === 'string') {
      eventList = eventList.filter(e => e.departmentId === department);
    }

    if (type && typeof type === 'string') {
      eventList = eventList.filter(e => e.type === type);
    }

    if (upcoming === 'true') {
      const now = new Date();
      eventList = eventList.filter(e => new Date(e.startTime) > now);
    }

    // Sort by start time
    eventList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    res.json({
      success: true,
      data: eventList,
    });
  })
);

/**
 * GET /events/:id
 * Get single event
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = events.get(id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const eventRsvps = rsvps.get(id) || [];
    const attendeeCount = eventRsvps.filter(r => r.status === 'registered').length;

    res.json({
      success: true,
      data: {
        ...event,
        attendeeCount,
        spotsRemaining: event.maxAttendees ? event.maxAttendees - attendeeCount : null,
      },
    });
  })
);

/**
 * POST /events/:id/rsvp
 * RSVP to an event
 */
router.post(
  '/:id/rsvp',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.sub;
    const event = events.get(id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    if (!event.rsvpRequired) {
      throw ApiError.badRequest('This event does not require RSVP');
    }

    let eventRsvps = rsvps.get(id) || [];

    // Check if already registered
    const existingRsvp = eventRsvps.find(r => r.userId === userId);
    if (existingRsvp) {
      throw ApiError.conflict('You are already registered for this event');
    }

    // Check capacity
    const registeredCount = eventRsvps.filter(r => r.status === 'registered').length;
    if (event.maxAttendees && registeredCount >= event.maxAttendees) {
      // Add to waitlist
      const rsvp = {
        eventId: id,
        userId,
        status: 'waitlisted',
        registeredAt: new Date().toISOString(),
      };
      eventRsvps.push(rsvp);
      rsvps.set(id, eventRsvps);

      res.status(201).json({
        success: true,
        data: {
          ...rsvp,
          message: 'You have been added to the waitlist',
        },
      });
      return;
    }

    const rsvp = {
      eventId: id,
      userId,
      status: 'registered',
      registeredAt: new Date().toISOString(),
    };
    eventRsvps.push(rsvp);
    rsvps.set(id, eventRsvps);

    res.status(201).json({
      success: true,
      data: rsvp,
    });
  })
);

/**
 * DELETE /events/:id/rsvp
 * Cancel RSVP
 */
router.delete(
  '/:id/rsvp',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.sub;

    let eventRsvps = rsvps.get(id) || [];
    const rsvpIndex = eventRsvps.findIndex(r => r.userId === userId);

    if (rsvpIndex === -1) {
      throw ApiError.notFound('RSVP not found');
    }

    eventRsvps.splice(rsvpIndex, 1);
    rsvps.set(id, eventRsvps);

    res.json({
      success: true,
      data: { message: 'RSVP cancelled' },
    });
  })
);

/**
 * GET /events/my-rsvps
 * Get current user's RSVPs
 */
router.get(
  '/user/my-rsvps',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    const userRsvps: { event: any; rsvp: any }[] = [];

    for (const [eventId, eventRsvps] of rsvps.entries()) {
      const userRsvp = eventRsvps.find(r => r.userId === userId);
      if (userRsvp) {
        const event = events.get(eventId);
        if (event) {
          userRsvps.push({ event, rsvp: userRsvp });
        }
      }
    }

    res.json({
      success: true,
      data: userRsvps,
    });
  })
);

export default router;
