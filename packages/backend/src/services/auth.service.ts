/**
 * Project Bold Platform - Authentication Service
 *
 * Handles SAML/Shibboleth SSO integration and session management.
 * Includes mock mode for development without UNC IdP access.
 */

import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger, logAudit } from '../utils/logger.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth.js';
import type { User, SAMLAttributes, AuthSession, UserRole } from '../types/index.js';

// =============================================================================
// MOCK USER DATA (Development Only)
// =============================================================================

const MOCK_USERS: Record<string, User & { samlAttributes: SAMLAttributes }> = {
  'student': {
    id: 'mock-student-001',
    pid: '730123456',
    onyen: 'jsmith',
    email: 'jsmith@unc.edu',
    firstName: 'Jane',
    lastName: 'Smith',
    affiliation: 'undergraduate',
    roles: ['student'],
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      displayTheme: 'system',
      accessibilityMode: false,
      language: 'en',
    },
    samlAttributes: {
      pid: '730123456',
      onyen: 'jsmith',
      email: 'jsmith@unc.edu',
      firstName: 'Jane',
      lastName: 'Smith',
      affiliation: 'student',
      eduPersonEntitlement: [],
    },
  },
  'org_leader': {
    id: 'mock-org-leader-001',
    pid: '730234567',
    onyen: 'mjones',
    email: 'mjones@unc.edu',
    firstName: 'Michael',
    lastName: 'Jones',
    affiliation: 'undergraduate',
    roles: ['student', 'org_leader'],
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      displayTheme: 'light',
      accessibilityMode: false,
      language: 'en',
    },
    samlAttributes: {
      pid: '730234567',
      onyen: 'mjones',
      email: 'mjones@unc.edu',
      firstName: 'Michael',
      lastName: 'Jones',
      affiliation: 'student',
      eduPersonEntitlement: [],
    },
  },
  'senator': {
    id: 'mock-senator-001',
    pid: '730345678',
    onyen: 'twilliams',
    email: 'twilliams@unc.edu',
    firstName: 'Taylor',
    lastName: 'Williams',
    affiliation: 'undergraduate',
    roles: ['student', 'senator'],
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      displayTheme: 'dark',
      accessibilityMode: false,
      language: 'en',
    },
    samlAttributes: {
      pid: '730345678',
      onyen: 'twilliams',
      email: 'twilliams@unc.edu',
      firstName: 'Taylor',
      lastName: 'Williams',
      affiliation: 'student',
      eduPersonEntitlement: ['urn:mace:unc.edu:projectbold:senator'],
    },
  },
  'cabinet': {
    id: 'mock-cabinet-001',
    pid: '730456789',
    onyen: 'abrown',
    email: 'abrown@unc.edu',
    firstName: 'Alex',
    lastName: 'Brown',
    affiliation: 'undergraduate',
    roles: ['student', 'cabinet'],
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      displayTheme: 'system',
      accessibilityMode: true,
      language: 'en',
    },
    samlAttributes: {
      pid: '730456789',
      onyen: 'abrown',
      email: 'abrown@unc.edu',
      firstName: 'Alex',
      lastName: 'Brown',
      affiliation: 'student',
      eduPersonEntitlement: ['urn:mace:unc.edu:projectbold:cabinet'],
    },
  },
  'admin': {
    id: 'mock-admin-001',
    pid: '730567890',
    onyen: 'dduncan',
    email: 'dduncan@unc.edu',
    firstName: 'Devin',
    lastName: 'Duncan',
    affiliation: 'undergraduate',
    roles: ['student', 'admin'],
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      displayTheme: 'system',
      accessibilityMode: false,
      language: 'en',
    },
    samlAttributes: {
      pid: '730567890',
      onyen: 'dduncan',
      email: 'dduncan@unc.edu',
      firstName: 'Devin',
      lastName: 'Duncan',
      affiliation: 'student',
      eduPersonEntitlement: ['urn:mace:unc.edu:projectbold:admin'],
    },
  },
};

// =============================================================================
// AUTH SERVICE
// =============================================================================

class AuthService {
  /**
   * Process SAML response and create/update user session
   */
  async processSAMLResponse(samlAttributes: SAMLAttributes): Promise<AuthSession> {
    logger.info('Processing SAML response', { onyen: samlAttributes.onyen });

    // In production, this would look up or create the user in the database
    // For now, we create a session based on SAML attributes
    const user = await this.findOrCreateUser(samlAttributes);

    const accessToken = generateAccessToken({
      sub: user.id,
      pid: user.pid,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken(user.id);

    logAudit('USER_LOGIN', user.id, {
      method: 'saml',
      onyen: user.onyen,
    });

    return {
      userId: user.id,
      roles: user.roles,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      samlAttributes,
    };
  }

  /**
   * Mock login for development
   */
  async mockLogin(role: keyof typeof MOCK_USERS = 'student'): Promise<AuthSession> {
    if (!config.saml.mockMode) {
      throw new Error('Mock login only available in development');
    }

    const mockUser = MOCK_USERS[role];
    if (!mockUser) {
      throw new Error(`Mock user role '${role}' not found`);
    }

    logger.info('Mock login', { role, userId: mockUser.id });

    const accessToken = generateAccessToken({
      sub: mockUser.id,
      pid: mockUser.pid,
      roles: mockUser.roles,
    });

    const refreshToken = generateRefreshToken(mockUser.id);

    logAudit('USER_LOGIN', mockUser.id, {
      method: 'mock',
      role,
    });

    return {
      userId: mockUser.id,
      roles: mockUser.roles,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      samlAttributes: mockUser.samlAttributes,
    };
  }

  /**
   * Refresh access token
   */
  async refreshSession(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date } | null> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    // In production, look up user from database
    const user = await this.findUserById(decoded.sub);
    if (!user) {
      return null;
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      pid: user.pid,
      roles: user.roles,
    });

    logAudit('TOKEN_REFRESH', user.id, {});

    return {
      accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    // In production, this would invalidate the refresh token in Redis/database
    logAudit('USER_LOGOUT', userId, {});
    logger.info('User logged out', { userId });
  }

  /**
   * Find or create user from SAML attributes
   */
  private async findOrCreateUser(samlAttributes: SAMLAttributes): Promise<User> {
    // In production, this would query the database
    // For now, we create a temporary user object
    const existingUser = Object.values(MOCK_USERS).find(
      u => u.onyen === samlAttributes.onyen
    );

    if (existingUser) {
      return existingUser;
    }

    // Create new user (in production, save to database)
    const newUser: User = {
      id: uuidv4(),
      pid: samlAttributes.pid,
      onyen: samlAttributes.onyen,
      email: samlAttributes.email,
      firstName: samlAttributes.firstName,
      lastName: samlAttributes.lastName,
      affiliation: this.mapAffiliation(samlAttributes.affiliation),
      roles: this.mapRoles(samlAttributes),
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        displayTheme: 'system',
        accessibilityMode: false,
        language: 'en',
      },
    };

    logAudit('USER_CREATED', newUser.id, {
      onyen: newUser.onyen,
      affiliation: newUser.affiliation,
    });

    return newUser;
  }

  /**
   * Find user by ID
   */
  private async findUserById(userId: string): Promise<User | null> {
    // In production, query database
    const user = Object.values(MOCK_USERS).find(u => u.id === userId);
    return user || null;
  }

  /**
   * Map SAML affiliation to our affiliation type
   */
  private mapAffiliation(affiliation: string): User['affiliation'] {
    const mapping: Record<string, User['affiliation']> = {
      'student': 'undergraduate',
      'undergraduate': 'undergraduate',
      'graduate': 'graduate',
      'faculty': 'faculty',
      'staff': 'staff',
      'alumni': 'alumni',
    };
    return mapping[affiliation.toLowerCase()] || 'undergraduate';
  }

  /**
   * Map SAML attributes to roles
   */
  private mapRoles(samlAttributes: SAMLAttributes): UserRole[] {
    const roles: UserRole[] = ['student'];

    // Check eduPersonEntitlement for special roles
    const entitlements = samlAttributes.eduPersonEntitlement || [];

    if (entitlements.includes('urn:mace:unc.edu:projectbold:admin')) {
      roles.push('admin');
    }
    if (entitlements.includes('urn:mace:unc.edu:projectbold:cabinet')) {
      roles.push('cabinet');
    }
    if (entitlements.includes('urn:mace:unc.edu:projectbold:senator')) {
      roles.push('senator');
    }

    return roles;
  }

  /**
   * Get mock users (dev only)
   */
  getMockUsers(): Record<string, User & { samlAttributes: SAMLAttributes }> {
    if (!config.saml.mockMode) {
      return {};
    }
    return MOCK_USERS;
  }
}

export const authService = new AuthService();
