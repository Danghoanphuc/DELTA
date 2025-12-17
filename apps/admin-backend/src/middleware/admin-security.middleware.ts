// apps/admin-backend/src/middleware/admin-security.middleware.ts
// ✅ ENHANCED SECURITY: Additional security middleware for admin endpoints

import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.config.js";
import { ForbiddenException } from "../shared/exceptions.js";

/**
 * ✅ ADMIN SECURITY: IP Whitelisting middleware
 * Only allow admin access from specific IP addresses in production
 */
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip IP checking in development
    if (config.env === "development") {
      return next();
    }

    // Get client IP
    const clientIP =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.headers["x-real-ip"]?.toString() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown";

    console.log(`🔒 [Admin Security] IP Check: ${clientIP}`);

    // Check if IP is whitelisted
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.warn(`⚠️ [Admin Security] Blocked IP: ${clientIP}`);
      throw new ForbiddenException("Access denied from this IP address");
    }

    next();
  };
};

/**
 * ✅ ADMIN SECURITY: Time-based access control
 * Only allow admin access during business hours
 */
export const businessHoursOnly = (
  startHour: number = 8,
  endHour: number = 18,
  timezone: string = "Asia/Ho_Chi_Minh"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip time checking in development
    if (config.env === "development") {
      return next();
    }

    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < startHour || currentHour >= endHour) {
      console.warn(
        `⚠️ [Admin Security] Access denied outside business hours: ${currentHour}:00`
      );
      throw new ForbiddenException(
        `Admin access is only allowed between ${startHour}:00 and ${endHour}:00`
      );
    }

    next();
  };
};

/**
 * ✅ ADMIN SECURITY: Require specific user agent patterns
 * Block suspicious or automated requests
 */
export const userAgentValidation = (allowedPatterns: RegExp[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers["user-agent"];

    if (!userAgent) {
      console.warn("⚠️ [Admin Security] Blocked request without User-Agent");
      throw new ForbiddenException("User-Agent header is required");
    }

    // Default allowed patterns (common browsers)
    const defaultPatterns = [/Chrome/i, /Firefox/i, /Safari/i, /Edge/i];

    const patterns =
      allowedPatterns.length > 0 ? allowedPatterns : defaultPatterns;
    const isAllowed = patterns.some((pattern) => pattern.test(userAgent));

    if (!isAllowed) {
      console.warn(
        `⚠️ [Admin Security] Blocked suspicious User-Agent: ${userAgent}`
      );
      throw new ForbiddenException("Access denied for this client");
    }

    next();
  };
};

/**
 * ✅ ADMIN SECURITY: Session activity tracking
 * Track and log admin activities for audit
 */
export const activityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;

  if (admin) {
    const activity = {
      adminId: admin._id,
      adminEmail: admin.email,
      action: `${req.method} ${req.path}`,
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    };

    // Log activity (in production, this should go to a secure audit log)
    console.log(`📋 [Admin Activity] ${JSON.stringify(activity)}`);

    // TODO: Store in audit log database
    // await AuditLog.create(activity);
  }

  next();
};

/**
 * ✅ ADMIN SECURITY: Require elevated permissions for sensitive operations
 */
export const requireElevatedPermissions = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;

  if (!admin) {
    throw new ForbiddenException("Authentication required");
  }

  // Check if admin has elevated permissions
  const elevatedRoles = ["super_admin", "admin"];
  if (!elevatedRoles.includes(admin.role)) {
    console.warn(
      `⚠️ [Admin Security] Insufficient permissions: ${admin.email} (${admin.role})`
    );
    throw new ForbiddenException(
      "Elevated permissions required for this operation"
    );
  }

  next();
};

/**
 * ✅ ADMIN SECURITY: Require super admin for critical operations
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;

  if (!admin) {
    throw new ForbiddenException("Authentication required");
  }

  if (admin.role !== "superadmin") {
    console.warn(
      `⚠️ [Admin Security] Super admin required: ${admin.email} (${admin.role})`
    );
    throw new ForbiddenException(
      "Super admin permissions required for this operation"
    );
  }

  next();
};

/**
 * ✅ ADMIN SECURITY: Composite security middleware
 * Apply multiple security checks at once
 */
export const adminSecuritySuite = (
  options: {
    allowedIPs?: string[];
    businessHours?: { start: number; end: number };
    requireElevated?: boolean;
    requireSuperAdmin?: boolean;
    logActivity?: boolean;
  } = {}
) => {
  const middlewares: Array<
    (req: Request, res: Response, next: NextFunction) => void
  > = [];

  // IP Whitelist
  if (options.allowedIPs) {
    middlewares.push(ipWhitelist(options.allowedIPs));
  }

  // Business Hours
  if (options.businessHours) {
    middlewares.push(
      businessHoursOnly(options.businessHours.start, options.businessHours.end)
    );
  }

  // User Agent Validation
  middlewares.push(userAgentValidation());

  // Activity Logging
  if (options.logActivity !== false) {
    middlewares.push(activityLogger);
  }

  // Permission Checks
  if (options.requireSuperAdmin) {
    middlewares.push(requireSuperAdmin);
  } else if (options.requireElevated) {
    middlewares.push(requireElevatedPermissions);
  }

  // Return combined middleware
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const runNext = (err?: any) => {
      if (err) return next(err);

      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      try {
        middleware(req, res, runNext);
      } catch (error) {
        next(error);
      }
    };

    runNext();
  };
};
