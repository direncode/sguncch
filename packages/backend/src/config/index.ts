/**
 * Project Bold Platform - Configuration
 *
 * Centralized configuration management with environment variable validation.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// =============================================================================
// ENVIRONMENT SCHEMA
// =============================================================================

const envSchema = z.object({
  // General
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  APP_URL: z.string().default('http://localhost:3000'),
  API_URL: z.string().default('http://localhost:4000'),

  // Database
  DATABASE_URL: z.string().default('postgresql://projectbold:projectbold@localhost:5432/projectbold_dev'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // SAML/Shibboleth
  SAML_ENABLED: z.string().default('false').transform(v => v === 'true'),
  SAML_MOCK_MODE: z.string().default('true').transform(v => v === 'true'),
  SAML_ENTRY_POINT: z.string().default('https://sso.unc.edu/idp/profile/SAML2/Redirect/SSO'),
  SAML_ISSUER: z.string().default('https://projectbold.unc.edu'),
  SAML_CALLBACK_URL: z.string().default('http://localhost:4000/auth/saml/callback'),
  SAML_CERT_PATH: z.string().optional(),
  SAML_PRIVATE_KEY_PATH: z.string().optional(),

  // Canvas LTI
  CANVAS_LTI_ENABLED: z.string().default('false').transform(v => v === 'true'),
  CANVAS_CLIENT_ID: z.string().optional(),
  CANVAS_DEPLOYMENT_ID: z.string().optional(),
  CANVAS_PLATFORM_URL: z.string().default('https://canvas.unc.edu'),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  AI_MATCHING_ENABLED: z.string().default('false').transform(v => v === 'true'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.string().default('debug'),

  // Feature Flags
  FEATURE_WELLNESS_MODULE: z.string().default('true').transform(v => v === 'true'),
  FEATURE_PEER_MENTORSHIP: z.string().default('true').transform(v => v === 'true'),
  FEATURE_CIVIC_HOURS: z.string().default('true').transform(v => v === 'true'),
  FEATURE_CULTURAL_CALENDAR: z.string().default('true').transform(v => v === 'true'),
  FEATURE_TRANSPARENCY_DASHBOARD: z.string().default('true').transform(v => v === 'true'),
  FEATURE_FOOD_RESOURCES: z.string().default('true').transform(v => v === 'true'),
});

// Validate environment
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envResult.error.format());
  process.exit(1);
}

const env = envResult.data;

// =============================================================================
// CONFIGURATION EXPORT
// =============================================================================

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  appUrl: env.APP_URL,
  apiUrl: env.API_URL,

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  saml: {
    enabled: env.SAML_ENABLED,
    mockMode: env.SAML_MOCK_MODE,
    entryPoint: env.SAML_ENTRY_POINT,
    issuer: env.SAML_ISSUER,
    callbackUrl: env.SAML_CALLBACK_URL,
    certPath: env.SAML_CERT_PATH,
    privateKeyPath: env.SAML_PRIVATE_KEY_PATH,
  },

  canvas: {
    enabled: env.CANVAS_LTI_ENABLED,
    clientId: env.CANVAS_CLIENT_ID,
    deploymentId: env.CANVAS_DEPLOYMENT_ID,
    platformUrl: env.CANVAS_PLATFORM_URL,
  },

  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL,
    matchingEnabled: env.AI_MATCHING_ENABLED,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  features: {
    wellnessModule: env.FEATURE_WELLNESS_MODULE,
    peerMentorship: env.FEATURE_PEER_MENTORSHIP,
    civicHours: env.FEATURE_CIVIC_HOURS,
    culturalCalendar: env.FEATURE_CULTURAL_CALENDAR,
    transparencyDashboard: env.FEATURE_TRANSPARENCY_DASHBOARD,
    foodResources: env.FEATURE_FOOD_RESOURCES,
  },
} as const;

export type Config = typeof config;
