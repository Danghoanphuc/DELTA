// apps/customer-backend/src/modules/delivery-checkin/performance.middleware.js
/**
 * Performance Middleware for Delivery Check-in API
 *
 * Provides:
 * - Response time monitoring
 * - Slow query logging
 * - Response compression hints
 * - Cache headers
 *
 * **Feature: delivery-checkin-system**
 * **Validates: Requirements 12.1, 12.5**
 */

import logger from "../../infrastructure/logger.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};
import { PERFORMANCE_CONFIG } from "../../services/performance-optimization.service.js";

/**
 * Response time monitoring middleware
 * Logs slow responses and adds timing headers
 */
export function responseTimeMiddleware(req, res, next) {
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Store start time on request for later use
  req.startTime = startTime;

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const diff = process.hrtime(startHrTime);
    const responseTime = diff[0] * 1000 + diff[1] / 1000000; // Convert to ms

    // Add timing header
    res.setHeader("X-Response-Time", `${responseTime.toFixed(2)}ms`);

    // Log slow responses
    if (responseTime > PERFORMANCE_CONFIG.MAX_RESPONSE_TIME_MS) {
      Logger.warn(
        `[PerfMiddleware] Slow response: ${req.method} ${
          req.originalUrl
        } took ${responseTime.toFixed(2)}ms (target: ${
          PERFORMANCE_CONFIG.MAX_RESPONSE_TIME_MS
        }ms)`
      );
    } else {
      Logger.debug(
        `[PerfMiddleware] ${req.method} ${
          req.originalUrl
        } completed in ${responseTime.toFixed(2)}ms`
      );
    }

    return originalEnd.apply(this, args);
  };

  next();
}

/**
 * Cache control middleware for GET requests
 * Sets appropriate cache headers based on endpoint
 */
export function cacheControlMiddleware(options = {}) {
  const {
    maxAge = 60, // Default 1 minute
    private: isPrivate = true,
    mustRevalidate = true,
  } = options;

  return (req, res, next) => {
    // Only apply to GET requests
    if (req.method !== "GET") {
      return next();
    }

    const directives = [];

    if (isPrivate) {
      directives.push("private");
    } else {
      directives.push("public");
    }

    directives.push(`max-age=${maxAge}`);

    if (mustRevalidate) {
      directives.push("must-revalidate");
    }

    res.setHeader("Cache-Control", directives.join(", "));

    next();
  };
}

/**
 * ETag middleware for conditional requests
 * Helps reduce bandwidth for unchanged resources
 */
export function etagMiddleware(req, res, next) {
  // Only apply to GET requests
  if (req.method !== "GET") {
    return next();
  }

  // Store original json method
  const originalJson = res.json;

  res.json = function (data) {
    // Generate simple ETag from data
    const etag = generateETag(data);
    res.setHeader("ETag", etag);

    // Check If-None-Match header
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Generate simple ETag from data
 * @param {any} data - Data to hash
 * @returns {string} ETag value
 */
function generateETag(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${hash.toString(16)}"`;
}

/**
 * Request size limiting middleware
 * Prevents oversized requests from consuming resources
 */
export function requestSizeLimitMiddleware(maxSize = 10 * 1024 * 1024) {
  // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > maxSize) {
      Logger.warn(
        `[PerfMiddleware] Request too large: ${contentLength} bytes (max: ${maxSize})`
      );
      return res.status(413).json({
        success: false,
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: `Request body too large. Maximum size is ${Math.round(
            maxSize / 1024 / 1024
          )}MB`,
        },
      });
    }

    next();
  };
}

/**
 * Pagination validation middleware
 * Ensures pagination parameters are within acceptable limits
 */
export function paginationMiddleware(req, res, next) {
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);

  // Validate page
  if (req.query.page !== undefined) {
    if (isNaN(page) || page < 1) {
      req.query.page = "1";
    }
  }

  // Validate and cap limit
  if (req.query.limit !== undefined) {
    if (isNaN(limit) || limit < 1) {
      req.query.limit = String(PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE);
    } else if (limit > PERFORMANCE_CONFIG.MAX_PAGE_SIZE) {
      req.query.limit = String(PERFORMANCE_CONFIG.MAX_PAGE_SIZE);
      Logger.debug(
        `[PerfMiddleware] Capped limit from ${limit} to ${PERFORMANCE_CONFIG.MAX_PAGE_SIZE}`
      );
    }
  }

  next();
}

/**
 * Geospatial bounds validation middleware
 * Validates and normalizes geographic bounds parameters
 */
export function boundsValidationMiddleware(req, res, next) {
  const { minLng, minLat, maxLng, maxLat } = req.query;

  // Skip if no bounds parameters
  if (!minLng && !minLat && !maxLng && !maxLat) {
    return next();
  }

  // Parse and validate
  const bounds = {
    minLng: parseFloat(minLng),
    minLat: parseFloat(minLat),
    maxLng: parseFloat(maxLng),
    maxLat: parseFloat(maxLat),
  };

  // Check for NaN
  if (Object.values(bounds).some(isNaN)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BOUNDS",
        message: "Invalid geographic bounds. All values must be numbers.",
      },
    });
  }

  // Validate ranges
  if (
    bounds.minLng < -180 ||
    bounds.maxLng > 180 ||
    bounds.minLat < -90 ||
    bounds.maxLat > 90
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BOUNDS",
        message: "Geographic bounds out of valid range.",
      },
    });
  }

  // Validate min < max
  if (bounds.minLng >= bounds.maxLng || bounds.minLat >= bounds.maxLat) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BOUNDS",
        message: "Invalid bounds: min values must be less than max values.",
      },
    });
  }

  // Limit bounds size to prevent overly large queries
  const lngRange = bounds.maxLng - bounds.minLng;
  const latRange = bounds.maxLat - bounds.minLat;
  const maxRange = 10; // Max 10 degrees in any direction

  if (lngRange > maxRange || latRange > maxRange) {
    Logger.warn(
      `[PerfMiddleware] Large bounds query: ${lngRange.toFixed(
        2
      )}° x ${latRange.toFixed(2)}°`
    );
  }

  // Attach validated bounds to request
  req.validatedBounds = bounds;

  next();
}

/**
 * Combined performance middleware
 * Applies all performance optimizations
 */
export function performanceMiddleware(options = {}) {
  return [
    responseTimeMiddleware,
    paginationMiddleware,
    boundsValidationMiddleware,
  ];
}

export default {
  responseTimeMiddleware,
  cacheControlMiddleware,
  etagMiddleware,
  requestSizeLimitMiddleware,
  paginationMiddleware,
  boundsValidationMiddleware,
  performanceMiddleware,
};
