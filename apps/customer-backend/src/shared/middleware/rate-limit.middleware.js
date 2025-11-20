// apps/customer-backend/src/shared/middleware/rate-limit.middleware.js
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { getRedisClient } from "../../infrastructure/cache/redis.js";
import { Logger } from "../utils/index.js";

/**
 * Rate Limiting Middleware Factory
 * Uses Redis for distributed rate limiting, falls back to in-memory if Redis unavailable
 */

// Store limiters globally to avoid recreating them on each request
let chatLimiter = null;
let uploadLimiter = null;
let generalLimiter = null;

/**
 * Initialize rate limiters with Redis or fallback to memory
 */
function initializeLimiters() {
  const redisClient = getRedisClient();
  
  if (redisClient && redisClient.status === "ready") {
    Logger.info("[RateLimit] Using Redis for rate limiting");
    
    // Chat Rate Limiter: 10 requests per minute
    chatLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "rl:chat",
      points: 10, // Number of requests
      duration: 60, // Per 60 seconds (1 minute)
      blockDuration: 60, // Block for 60 seconds if exceeded
    });

    // Upload Rate Limiter: 20 uploads per hour
    uploadLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "rl:upload",
      points: 20,
      duration: 3600, // Per 3600 seconds (1 hour)
      blockDuration: 300, // Block for 5 minutes if exceeded
    });

    // General API Rate Limiter: 100 requests per minute
    generalLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "rl:general",
      points: 100,
      duration: 60,
      blockDuration: 60,
    });
  } else {
    Logger.warn(
      "[RateLimit] Redis not available, using in-memory rate limiting (not distributed)"
    );
    
    // Fallback to in-memory limiters
    chatLimiter = new RateLimiterMemory({
      keyPrefix: "rl:chat",
      points: 10,
      duration: 60,
      blockDuration: 60,
    });

    uploadLimiter = new RateLimiterMemory({
      keyPrefix: "rl:upload",
      points: 20,
      duration: 3600,
      blockDuration: 300,
    });

    generalLimiter = new RateLimiterMemory({
      keyPrefix: "rl:general",
      points: 100,
      duration: 60,
      blockDuration: 60,
    });
  }
}

/**
 * Get rate limiter key based on user or IP
 * @param {import('express').Request} req
 * @param {string} prefix
 * @returns {string}
 */
function getRateLimitKey(req, prefix = "global") {
  // Prefer userId if authenticated
  if (req.user && req.user._id) {
    return `${prefix}:user:${req.user._id}`;
  }
  
  // Fallback to IP address
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  return `${prefix}:ip:${ip}`;
}

/**
 * Create rate limit middleware
 * @param {RateLimiterRedis|RateLimiterMemory} limiter
 * @param {string} name - Limiter name for logging
 * @returns {import('express').RequestHandler}
 */
function createRateLimitMiddleware(limiter, name = "API") {
  return async (req, res, next) => {
    // Initialize limiters if not already done
    if (!chatLimiter || !uploadLimiter || !generalLimiter) {
      initializeLimiters();
    }

    const key = getRateLimitKey(req, name.toLowerCase());

    try {
      const rateLimiterRes = await limiter.consume(key);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": new Date(
          Date.now() + rateLimiterRes.msBeforeNext
        ).toISOString(),
      });

      next();
    } catch (rejRes) {
      // Rate limit exceeded
      if (rejRes instanceof Error) {
        // Error consuming rate limit (e.g., Redis connection issue)
        Logger.error(`[RateLimit] Error in ${name} limiter:`, rejRes.message);
        // Allow request to proceed if rate limiter fails
        return next();
      }

      // Rate limit exceeded
      const retryAfterSeconds = Math.round(rejRes.msBeforeNext / 1000) || 1;

      res.set({
        "Retry-After": retryAfterSeconds,
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": new Date(
          Date.now() + rejRes.msBeforeNext
        ).toISOString(),
      });

      Logger.warn(
        `[RateLimit] ${name} limit exceeded for key: ${key.substring(0, 30)}...`
      );

      return res.status(429).json({
        success: false,
        message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfterSeconds} giây.`,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: retryAfterSeconds,
          limit: limiter.points,
          window: `${limiter.duration} seconds`,
        },
      });
    }
  };
}

/**
 * Chat Rate Limiter Middleware
 * Limit: 10 requests per minute per user/IP
 */
export const chatRateLimiter = (req, res, next) => {
  if (!chatLimiter) {
    initializeLimiters();
  }
  return createRateLimitMiddleware(chatLimiter, "Chat")(req, res, next);
};

/**
 * Upload Rate Limiter Middleware
 * Limit: 20 uploads per hour per user/IP
 */
export const uploadRateLimiter = (req, res, next) => {
  if (!uploadLimiter) {
    initializeLimiters();
  }
  return createRateLimitMiddleware(uploadLimiter, "Upload")(req, res, next);
};

/**
 * General API Rate Limiter Middleware
 * Limit: 100 requests per minute per IP
 * Apply this globally to protect against DDoS
 */
export const generalRateLimiter = (req, res, next) => {
  if (!generalLimiter) {
    initializeLimiters();
  }
  return createRateLimitMiddleware(generalLimiter, "General")(req, res, next);
};

/**
 * Initialize rate limiters on server startup
 * Call this after Redis connection is established
 */
export function initRateLimiters() {
  initializeLimiters();
  Logger.success("[RateLimit] Rate limiters initialized");
}

