// apps/admin-backend/src/middleware/rate-limit.middleware.ts
import type { Request, Response, NextFunction } from "express";

// ✅ SECURITY: Simple in-memory rate limiter (for production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = "Quá nhiều yêu cầu, vui lòng thử lại sau",
    skipSuccessfulRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client identifier (IP address)
    const identifier =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "unknown";

    const key = `${identifier}:${req.path}`;
    const now = Date.now();

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const record = store[key];

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(record.resetTime).toISOString()
      );

      return res.status(429).json({
        success: false,
        message,
        retryAfter,
      });
    }

    // Increment counter
    record.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      (maxRequests - record.count).toString()
    );
    res.setHeader("X-RateLimit-Reset", new Date(record.resetTime).toISOString());

    // Optionally skip counting successful requests
    if (skipSuccessfulRequests) {
      res.on("finish", () => {
        if (res.statusCode < 400) {
          record.count--;
        }
      });
    }

    next();
  };
};

// ✅ SECURITY: Pre-configured rate limiters for common use cases

// Strict rate limit for authentication endpoints (prevent brute force)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút",
});

// Moderate rate limit for sensitive operations
export const sensitiveRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
});

// General API rate limit
export const generalRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
  skipSuccessfulRequests: false,
});

