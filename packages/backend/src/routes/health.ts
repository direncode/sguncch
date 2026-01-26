/**
 * Project Bold Platform - Health Check Routes
 */

import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../database/index.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'project-bold-api',
    version: '1.0.0',
  });
});

/**
 * GET /health/ready
 * Readiness check (includes dependencies)
 */
router.get('/ready', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();

  const status = dbHealthy ? 'ready' : 'not_ready';
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
    },
  });
});

/**
 * GET /health/live
 * Liveness check (is the service running)
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/info
 * Service information
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    service: 'Project Bold Policy Platform',
    version: '1.0.0',
    environment: config.env,
    features: config.features,
    samlMode: config.saml.mockMode ? 'mock' : 'production',
  });
});

export default router;
