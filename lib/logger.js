/**
 * Centralized Logging System for Project Bold
 *
 * Usage:
 *   import { createLogger } from '../lib/logger'
 *   const log = createLogger('ModuleName')
 *   log.info('Something happened', { key: 'value' })
 *   log.error('Something broke', { error: err.message })
 *   log.warn('Watch out')
 *   log.debug('Verbose detail')
 *   log.time('supabase-query')
 *   log.timeEnd('supabase-query')
 */

const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 }

const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
const isServer = typeof window === 'undefined'

// Current log level threshold
const currentLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO

// Performance timers
const timers = new Map()

// Async log queue for Supabase persistence (avoids circular imports)
let _writeAppLog = null
const logQueue = []
let flushTimer = null

/**
 * Register the Supabase log writer (called from supabase.js to avoid circular deps)
 */
export function registerLogWriter(writer) {
  _writeAppLog = writer
  // Flush any queued logs
  if (logQueue.length > 0) {
    const queued = [...logQueue]
    logQueue.length = 0
    queued.forEach(entry => _persistLog(entry))
  }
}

function _persistLog({ level, module, message, metadata, correlationId }) {
  if (!_writeAppLog) {
    logQueue.push({ level, module, message, metadata, correlationId })
    // Cap queue to prevent memory leaks
    if (logQueue.length > 100) logQueue.shift()
    return
  }
  try {
    _writeAppLog(level, module, message, metadata, correlationId).catch(() => {
      // Silent fail — don't log about logging failures
    })
  } catch {
    // Silent fail
  }
}

// Correlation ID for request tracing
let _correlationId = null

export function setCorrelationId(id) {
  _correlationId = id
}

export function getCorrelationId() {
  return _correlationId
}

export function generateCorrelationId() {
  const id = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  _correlationId = id
  return id
}

/**
 * Format a log entry
 */
function formatLog(level, module, message, metadata) {
  const timestamp = new Date().toISOString()
  const corrId = _correlationId

  if (isDev) {
    // Pretty dev output
    const colors = { ERROR: '\x1b[31m', WARN: '\x1b[33m', INFO: '\x1b[36m', DEBUG: '\x1b[90m' }
    const reset = '\x1b[0m'
    const color = colors[level] || reset
    const prefix = `${color}[${level}]${reset} [${module}]`
    const extra = metadata && Object.keys(metadata).length > 0
      ? ` ${JSON.stringify(metadata)}`
      : ''
    const corr = corrId ? ` (${corrId})` : ''
    return { formatted: `${prefix} ${message}${extra}${corr}`, timestamp }
  }

  // Structured JSON for production
  return {
    formatted: JSON.stringify({
      timestamp,
      level,
      module,
      message,
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
      ...(corrId ? { correlationId: corrId } : {}),
    }),
    timestamp,
  }
}

/**
 * Create a module-scoped logger
 */
export function createLogger(module) {
  function log(level, message, metadata = {}) {
    if (LOG_LEVELS[level] > currentLevel) return

    const { formatted } = formatLog(level, module, message, metadata)

    // Output to console
    switch (level) {
      case 'ERROR':
        console.error(formatted)
        break
      case 'WARN':
        console.warn(formatted)
        break
      case 'DEBUG':
        if (isDev) console.debug(formatted)
        break
      default:
        console.log(formatted)
    }

    // Persist critical logs to Supabase (errors and warns, server-side only)
    if (isServer && (level === 'ERROR' || level === 'WARN')) {
      _persistLog({
        level,
        module,
        message,
        metadata: typeof metadata === 'object' ? metadata : { value: metadata },
        correlationId: _correlationId,
      })
    }
  }

  return {
    error: (message, metadata) => log('ERROR', message, metadata),
    warn: (message, metadata) => log('WARN', message, metadata),
    info: (message, metadata) => log('INFO', message, metadata),
    debug: (message, metadata) => log('DEBUG', message, metadata),

    /**
     * Start a performance timer
     */
    time: (label) => {
      timers.set(`${module}:${label}`, performance.now())
    },

    /**
     * End a performance timer and log the duration
     */
    timeEnd: (label) => {
      const key = `${module}:${label}`
      const start = timers.get(key)
      if (start) {
        const duration = Math.round(performance.now() - start)
        timers.delete(key)
        log('INFO', `${label} completed`, { durationMs: duration })
      }
    },
  }
}

/**
 * Middleware helper for API routes — sets up correlation ID and request logging
 */
export function withRequestLogging(handler, routeName) {
  const log = createLogger(`API:${routeName}`)

  return async (req, res) => {
    const correlationId = generateCorrelationId()
    const start = Date.now()

    log.info(`${req.method} ${req.url}`, {
      method: req.method,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      correlationId,
    })

    // Wrap res.end to log response
    const originalEnd = res.end.bind(res)
    res.end = function (...args) {
      const duration = Date.now() - start
      log.info(`Response ${res.statusCode}`, {
        statusCode: res.statusCode,
        durationMs: duration,
        correlationId,
      })
      return originalEnd(...args)
    }

    try {
      return await handler(req, res)
    } catch (err) {
      log.error('Unhandled error', {
        error: err.message,
        stack: isDev ? err.stack : undefined,
        correlationId,
      })
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
}
