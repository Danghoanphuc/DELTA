// apps/customer-backend/src/modules/delivery-checkin/security.middleware.js

import { SecurityService } from "./security.service.js";
import { UnauthorizedException } from "../../shared/exceptions/index.js";
import logger from "../../infrastructure/logger.js";

// Create Logger wrapper for consistency
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

const securityService = new SecurityService();

/**
 * Middleware to enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 *
 * **Feature: delivery-checkin-system, Property: HTTPS Enforcement**
 * **Validates: Requirements 13.1**
 */
export const enforceHTTPS = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  // Check if request is already HTTPS
  // x-forwarded-proto is set by load balancers/proxies
  const isHTTPS =
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    req.protocol === "https";

  if (!isHTTPS) {
    Logger.warn(
      `[SecurityMiddleware] HTTP request detected in production, redirecting to HTTPS`
    );

    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  // Set security headers
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  next();
};

/**
 * Middleware to verify photo access for authenticated users only
 *
 * **Feature: delivery-checkin-system, Property 45: Photo Access Control**
 * **Validates: Requirements 13.2**
 */
export const verifyPhotoAccess = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      Logger.debug(
        `[SecurityMiddleware] Photo access denied: User not authenticated`
      );
      throw new UnauthorizedException("Yêu cầu đăng nhập để xem ảnh giao hàng");
    }

    // If check-in is attached to request (from previous middleware), verify access
    if (req.checkin) {
      const canAccess = securityService.verifyPhotoAccessSafe(
        req.user,
        req.checkin
      );
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem ảnh của check-in này",
        });
      }
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return res.status(401).json({
        success: false,
        message: error.message,
        requiresAuth: true,
      });
    }
    next(error);
  }
};

/**
 * Middleware to sanitize GPS coordinates in response
 * Applies GPS privacy rules based on user authorization
 *
 * **Feature: delivery-checkin-system, Property 46: GPS Coordinate Privacy**
 * **Validates: Requirements 13.3**
 */
export const sanitizeGPSInResponse = (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to sanitize GPS data
  res.json = (data) => {
    if (data && data.data) {
      // Sanitize single check-in
      if (data.data.checkin) {
        data.data.checkin = securityService.sanitizeCheckinForResponse(
          req.user,
          data.data.checkin
        );
      }

      // Sanitize array of check-ins
      if (data.data.checkins && Array.isArray(data.data.checkins)) {
        data.data.checkins = securityService.sanitizeCheckinsForResponse(
          req.user,
          data.data.checkins
        );
      }
    }

    return originalJson(data);
  };

  next();
};

/**
 * Middleware to add security headers to all responses
 *
 * **Validates: Requirements 13.1**
 */
export const addSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Content Security Policy for API responses
  res.setHeader("Content-Security-Policy", "default-src 'none'");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

/**
 * Combined security middleware for delivery check-in routes
 * Applies all security controls in one middleware
 */
export const applySecurityControls = [enforceHTTPS, addSecurityHeaders];

/**
 * Security middleware for photo-related endpoints
 */
export const photoSecurityMiddleware = [
  enforceHTTPS,
  addSecurityHeaders,
  verifyPhotoAccess,
];
