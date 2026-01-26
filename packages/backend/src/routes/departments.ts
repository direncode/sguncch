/**
 * Project Bold Platform - Departments Routes
 *
 * API endpoints for department data and policies.
 * Maps directly to the 8 departments in the Policy Book.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { optionalAuth } from '../middleware/auth.js';
import { DEPARTMENTS, POLICIES } from '@project-bold/shared';

const router = Router();

/**
 * GET /departments
 * List all departments
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const departments = Object.values(DEPARTMENTS).map(dept => ({
      ...dept,
      policyCount: Object.values(POLICIES).filter(p => p.departmentId === dept.slug).length,
    }));

    res.json({
      success: true,
      data: departments,
    });
  })
);

/**
 * GET /departments/:slug
 * Get single department with its policies
 */
router.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const department = Object.values(DEPARTMENTS).find(d => d.slug === slug);

    if (!department) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Department not found',
        },
      });
      return;
    }

    const policies = Object.values(POLICIES)
      .filter(p => p.departmentId === slug)
      .sort((a, b) => a.number - b.number);

    res.json({
      success: true,
      data: {
        ...department,
        policies,
      },
    });
  })
);

/**
 * GET /departments/:slug/policies
 * Get policies for a department
 */
router.get(
  '/:slug/policies',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const department = Object.values(DEPARTMENTS).find(d => d.slug === slug);

    if (!department) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Department not found',
        },
      });
      return;
    }

    const policies = Object.values(POLICIES)
      .filter(p => p.departmentId === slug)
      .sort((a, b) => a.number - b.number);

    res.json({
      success: true,
      data: policies,
    });
  })
);

export default router;
