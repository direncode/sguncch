/**
 * Project Bold Policy Platform - Backend API Server
 *
 * A unified, mobile-first, UNC-native digital hub implementing
 * Devin Duncan's 2026-2027 Student Body President vision.
 *
 * Values: Courage, Community, Accountability, Equity, Innovation
 * Tagline: First, Best, For All
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { rateLimiter } from './middleware/rateLimit.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import departmentRoutes from './routes/departments.js';
import policyRoutes from './routes/policies.js';
import academicRoutes from './routes/academic.js';
import basicNeedsRoutes from './routes/basicNeeds.js';
import civicRoutes from './routes/civic.js';
import deiRoutes from './routes/dei.js';
import wellnessRoutes from './routes/wellness.js';
import environmentalRoutes from './routes/environmental.js';
import stateExternalRoutes from './routes/stateExternal.js';
import communicationsRoutes from './routes/communications.js';
import eventsRoutes from './routes/events.js';
import feedbackRoutes from './routes/feedback.js';
import ltiRoutes from './routes/lti.js';
import healthRoutes from './routes/health.js';

const app = express();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Canvas LTI embedding
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// Rate limiting
app.use(rateLimiter);

// =============================================================================
// ROUTES
// =============================================================================

// Health check (no auth required)
app.use('/health', healthRoutes);

// Authentication
app.use('/auth', authRoutes);

// Canvas LTI integration
app.use('/lti', ltiRoutes);

// API v1 routes
const apiV1 = express.Router();

apiV1.use('/users', userRoutes);
apiV1.use('/departments', departmentRoutes);
apiV1.use('/policies', policyRoutes);
apiV1.use('/academic', academicRoutes);
apiV1.use('/basic-needs', basicNeedsRoutes);
apiV1.use('/civic', civicRoutes);
apiV1.use('/dei', deiRoutes);
apiV1.use('/wellness', wellnessRoutes);
apiV1.use('/environmental', environmentalRoutes);
apiV1.use('/state', stateExternalRoutes);
apiV1.use('/communications', communicationsRoutes);
apiV1.use('/events', eventsRoutes);
apiV1.use('/feedback', feedbackRoutes);

app.use('/api/v1', apiV1);

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎓 PROJECT BOLD POLICY PLATFORM                             ║
║   First, Best, For All                                        ║
║                                                               ║
║   Server running on port ${PORT}                                 ║
║   Environment: ${config.env.padEnd(44)}║
║                                                               ║
║   API:  http://localhost:${PORT}/api/v1                          ║
║   Auth: http://localhost:${PORT}/auth                            ║
║   LTI:  http://localhost:${PORT}/lti                             ║
║                                                               ║
║   Together, We Go Bold.                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  if (config.saml.mockMode) {
    logger.warn('⚠️  SAML Mock Mode is ENABLED - for development only');
  }
});

export default app;
