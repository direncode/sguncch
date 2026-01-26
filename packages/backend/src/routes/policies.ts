/**
 * Project Bold Platform - Policies Routes
 *
 * API endpoints for policy tracking and progress updates.
 * All 40 policies from the Policy Book are tracked here.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { authenticateToken, requireCabinet, optionalAuth } from '../middleware/auth.js';
import { POLICIES, DEPARTMENTS } from '../types/index.js';

const router = Router();

// In-memory progress storage (replace with database in production)
const policyProgressMap: Record<string, {
  progress: number;
  status: string;
  updates: { date: string; text: string; updatedBy: string }[];
}> = {};

/**
 * GET /policies
 * List all policies with optional filtering
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { department, status, search } = req.query;

    let policies = Object.values(POLICIES).map(policy => ({
      ...policy,
      departmentName: Object.values(DEPARTMENTS).find(d => d.slug === policy.departmentId)?.name,
      progress: policyProgressMap[policy.id]?.progress ?? 0,
      status: policyProgressMap[policy.id]?.status ?? 'proposed',
    }));

    // Filter by department
    if (department && typeof department === 'string') {
      policies = policies.filter(p => p.departmentId === department);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      policies = policies.filter(p => p.status === status);
    }

    // Search by title or description
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      policies = policies.filter(
        p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: policies,
      meta: {
        total: policies.length,
      },
    });
  })
);

/**
 * GET /policies/:id
 * Get single policy with progress history
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const policy = Object.values(POLICIES).find(p => p.id === id);

    if (!policy) {
      throw ApiError.notFound('Policy not found');
    }

    const progress = policyProgressMap[id] ?? {
      progress: 0,
      status: 'proposed',
      updates: [],
    };

    const department = Object.values(DEPARTMENTS).find(d => d.slug === policy.departmentId);

    res.json({
      success: true,
      data: {
        ...policy,
        department,
        ...progress,
      },
    });
  })
);

/**
 * POST /policies/:id/progress
 * Update policy progress (cabinet/admin only)
 */
router.post(
  '/:id/progress',
  authenticateToken,
  requireCabinet,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { progress, status, updateText } = req.body;

    const policy = Object.values(POLICIES).find(p => p.id === id);

    if (!policy) {
      throw ApiError.notFound('Policy not found');
    }

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      throw ApiError.badRequest('Progress must be a number between 0 and 100');
    }

    // Initialize or update progress
    if (!policyProgressMap[id]) {
      policyProgressMap[id] = {
        progress: 0,
        status: 'proposed',
        updates: [],
      };
    }

    policyProgressMap[id].progress = progress;
    if (status) {
      policyProgressMap[id].status = status;
    }

    if (updateText) {
      policyProgressMap[id].updates.unshift({
        date: new Date().toISOString(),
        text: updateText,
        updatedBy: req.user!.sub,
      });
    }

    res.json({
      success: true,
      data: {
        id,
        ...policyProgressMap[id],
      },
    });
  })
);

/**
 * GET /policies/stats
 * Get overall policy statistics
 */
router.get(
  '/stats/overview',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const allPolicies = Object.values(POLICIES);
    const totalPolicies = allPolicies.length;

    const statusCounts = {
      proposed: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0,
      deferred: 0,
    };

    let totalProgress = 0;

    allPolicies.forEach(policy => {
      const progress = policyProgressMap[policy.id];
      const status = (progress?.status ?? 'proposed') as keyof typeof statusCounts;
      statusCounts[status]++;
      totalProgress += progress?.progress ?? 0;
    });

    const avgProgress = totalProgress / totalPolicies;

    // Group by department
    const byDepartment = Object.values(DEPARTMENTS).map(dept => {
      const deptPolicies = allPolicies.filter(p => p.departmentId === dept.slug);
      const deptProgress = deptPolicies.reduce(
        (sum, p) => sum + (policyProgressMap[p.id]?.progress ?? 0),
        0
      );
      return {
        department: dept.name,
        slug: dept.slug,
        policyCount: deptPolicies.length,
        averageProgress: deptPolicies.length > 0 ? deptProgress / deptPolicies.length : 0,
      };
    });

    res.json({
      success: true,
      data: {
        total: totalPolicies,
        averageProgress: Math.round(avgProgress),
        statusBreakdown: statusCounts,
        byDepartment,
      },
    });
  })
);

export default router;
