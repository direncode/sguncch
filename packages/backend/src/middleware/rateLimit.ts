/**
 * Project Bold Platform - Rate Limiting Middleware
 *
 * Protects API from abuse while ensuring accessibility for legitimate users.
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Default rate limiter for general API endpoints
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI service rate limiter (more restrictive due to cost)
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMITED',
      message: 'AI service rate limit reached, please try again shortly.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Feedback submission rate limiter
 */
export const feedbackRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 feedback submissions per hour
  message: {
    success: false,
    error: {
      code: 'FEEDBACK_RATE_LIMITED',
      message: 'Feedback submission limit reached, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
