/**
 * Project Bold Platform - State & External Affairs Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /state/lobby-days
 * Heels on the Hill events
 */
router.get(
  '/lobby-days',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const events = [
      {
        id: 'ld-1',
        title: 'Heels on the Hill 2026',
        date: '2026-03-25',
        location: 'NC General Assembly, Raleigh',
        description: 'Annual state advocacy day for UNC students.',
        trainingRequired: true,
        trainingDate: '2026-03-18',
        issues: [
          { title: 'Higher Education Funding', summary: 'Advocating for increased state support for UNC System.' },
          { title: 'Student Financial Aid', summary: 'Supporting expansion of need-based aid programs.' },
          { title: 'Mental Health Resources', summary: 'Funding for campus mental health services.' },
        ],
        registrationDeadline: '2026-03-15',
        maxParticipants: 50,
        registeredCount: 32,
      },
    ];

    res.json({ success: true, data: events });
  })
);

/**
 * GET /state/legislator-visits
 * Legislators-in-Residence events
 */
router.get(
  '/legislator-visits',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const visits = [
      {
        id: 'lv-1',
        legislatorName: 'Rep. Sample Legislator',
        title: 'NC House Representative',
        district: 'District 56',
        visitDate: '2026-02-20',
        events: [
          { type: 'panel', title: 'Higher Ed Policy Discussion', time: '14:00', location: 'Carroll Hall 111' },
          { type: 'office_hours', title: 'Student Q&A', time: '16:00', location: 'Student Union 3201' },
        ],
      },
    ];

    res.json({ success: true, data: visits });
  })
);

/**
 * GET /state/alumni-mentors
 * Alumni in Public Service Network
 */
router.get(
  '/alumni-mentors',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const mentors = [
      {
        id: 'am-1',
        name: 'Jordan Public',
        graduationYear: 2018,
        currentTitle: 'Policy Analyst',
        organization: 'NC Department of Commerce',
        sector: 'government',
        bio: 'Working on economic development policy for rural NC communities.',
        mentorshipType: 'short_term',
        availability: 'Monthly video calls',
      },
      {
        id: 'am-2',
        name: 'Taylor Service',
        graduationYear: 2020,
        currentTitle: 'Program Manager',
        organization: 'United Way of the Greater Triangle',
        sector: 'nonprofit',
        bio: 'Managing community investment programs.',
        mentorshipType: 'micro',
        availability: 'One-time coffee chats',
      },
    ];

    res.json({ success: true, data: mentors });
  })
);

/**
 * GET /state/roundtables
 * Nonpartisan roundtable discussions
 */
router.get(
  '/roundtables',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const roundtables = [
      {
        id: 'rt-1',
        title: 'Campus Safety: A Student Dialogue',
        date: '2026-02-25',
        time: '18:00',
        location: 'Student Union 3201',
        partnerOrganizations: ['Student Government', 'Campus Safety Commission'],
        description: 'A facilitated discussion on improving campus safety.',
        registrationOpen: true,
      },
      {
        id: 'rt-2',
        title: 'The Future of Higher Ed in NC',
        date: '2026-03-10',
        time: '17:00',
        location: 'Carroll Hall 111',
        partnerOrganizations: ['Political Science Student Association', 'Public Policy Student Association'],
        description: 'Exploring trends and challenges in North Carolina higher education.',
        registrationOpen: true,
      },
    ];

    res.json({ success: true, data: roundtables });
  })
);

export default router;
