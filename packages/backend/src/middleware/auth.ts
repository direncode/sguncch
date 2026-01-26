/**
 * Project Bold Platform - Authentication Middleware
 *
 * JWT-based authentication with role-based access control.
 * Integrates with UNC Shibboleth SAML for SSO.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from './error.js';
import { logAudit } from '../utils/logger.js';
import type { UserRole, JWTPayload } from '../types/index.js';

/**
 * Verify JWT token and attach user to request
 */
export function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid token');
    }
    throw err;
  }
}

/**
 * Optional authentication - attaches user if token present, continues otherwise
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    req.user = decoded;
  } catch {
    // Token invalid, but continue without user
  }

  next();
}

/**
 * Require specific roles for access
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const hasRole = req.user.roles.some((role: UserRole) => allowedRoles.includes(role));

    if (!hasRole) {
      logAudit('ACCESS_DENIED', req.user.sub, {
        requiredRoles: allowedRoles,
        userRoles: req.user.roles,
        path: req.path,
      });
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRoles('admin');

/**
 * Require cabinet member or admin
 */
export const requireCabinet = requireRoles('cabinet', 'admin');

/**
 * Require senator, cabinet, or admin
 */
export const requireSenator = requireRoles('senator', 'cabinet', 'admin');

/**
 * Require org leader or higher
 */
export const requireOrgLeader = requireRoles('org_leader', 'senator', 'cabinet', 'admin');

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { sub: string; type: string };
    if (decoded.type !== 'refresh') {
      return null;
    }
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}

/**
 * Check if user owns a resource or has admin access
 */
export function requireOwnerOrAdmin(getUserIdFromRequest: (req: Request) => string | null) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const resourceUserId = getUserIdFromRequest(req);

    // Admins can access any resource
    if (req.user.roles.includes('admin')) {
      return next();
    }

    // Owner can access their own resource
    if (resourceUserId && req.user.sub === resourceUserId) {
      return next();
    }

    logAudit('OWNER_ACCESS_DENIED', req.user.sub, {
      resourceUserId,
      path: req.path,
    });

    throw ApiError.forbidden('You can only access your own resources');
  };
}

/**
 * Rate limiter for auth endpoints (re-exported from rateLimit)
 */
export { authRateLimiter } from './rateLimit.js';
