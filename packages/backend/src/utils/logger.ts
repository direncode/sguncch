/**
 * Project Bold Platform - Logger Utility
 *
 * Winston-based logging with structured output for debugging and audit trails.
 */

import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        logFormat,
      ),
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Add file transports in production
if (config.env === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), winston.format.json()),
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), winston.format.json()),
    })
  );
}

// Create audit logger for security events
export const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'project-bold-audit' },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

if (config.env === 'production') {
  auditLogger.add(
    new winston.transports.File({
      filename: 'logs/audit.log',
      format: combine(timestamp(), winston.format.json()),
    })
  );
}

/**
 * Log an audit event (for security/compliance tracking)
 */
export function logAudit(
  action: string,
  userId: string | null,
  details: Record<string, unknown>
): void {
  auditLogger.info(action, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API request for analytics
 */
export function logApiRequest(
  method: string,
  path: string,
  userId: string | null,
  statusCode: number,
  duration: number
): void {
  logger.http('API Request', {
    method,
    path,
    userId,
    statusCode,
    duration: `${duration}ms`,
  });
}
