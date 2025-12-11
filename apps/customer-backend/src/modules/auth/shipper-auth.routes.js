// apps/customer-backend/src/modules/auth/shipper-auth.routes.js
/**
 * Shipper Authentication Routes
 * Routes for shipper registration and profile management
 */

import { Router } from "express";
import { ShipperAuthController } from "./shipper-auth.controller.js";
import { createRateLimitMiddleware } from "../../shared/middleware/rate-limit.middleware.js";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { getRedisClient } from "../../infrastructure/cache/redis.js";
import { config } from "../../config/env.config.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const shipperAuthController = new ShipperAuthController();

// Rate limiter for shipper registration
const isDevelopment = config.env === "development";
const redisClient = getRedisClient();

const ShipperRegisterRateLimiter =
  redisClient && redisClient.status === "ready"
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl:shipper-register",
        points: isDevelopment ? 100 : 5, // 100 in dev, 5 in production
        duration: 15 * 60, // per 15 minutes
        blockDuration: isDevelopment ? 60 : 15 * 60,
      })
    : new RateLimiterMemory({
        keyPrefix: "rl:shipper-register",
        points: isDevelopment ? 100 : 5,
        duration: 15 * 60,
        blockDuration: isDevelopment ? 60 : 15 * 60,
      });

const shipperRegisterRateLimit = createRateLimitMiddleware(
  ShipperRegisterRateLimiter,
  "ShipperRegister"
);

// Public routes
router.post(
  "/signup-shipper",
  shipperRegisterRateLimit,
  shipperAuthController.signUpShipper
);

// Protected routes (require authentication)
router.get(
  "/shipper/profile",
  protect,
  shipperAuthController.getShipperProfile
);

export default router;
