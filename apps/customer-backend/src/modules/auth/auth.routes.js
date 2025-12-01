// src/modules/auth/auth.routes.js
import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { PusherController } from "./pusher.controller.js";
import { createRateLimitMiddleware } from "../../shared/middleware/rate-limit.middleware.js";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { getRedisClient } from "../../infrastructure/cache/redis.js";
import { config } from "../../config/env.config.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const authController = new AuthController();
const pusherController = new PusherController();

// ✅ SECURITY: Rate limiters cho auth endpoints
// Tăng rate limit cho development environment để dễ test
const isDevelopment = config.env === "development";

const redisClient = getRedisClient();
const AuthRateLimiter =
  redisClient && redisClient.status === "ready"
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl:auth",
        points: isDevelopment ? 200 : 5, // 200 attempts in dev, 5 in production
        duration: 15 * 60, // per 15 minutes
        blockDuration: isDevelopment ? 60 : 15 * 60, // 1 min in dev, 15 min in production
      })
    : new RateLimiterMemory({
        keyPrefix: "rl:auth",
        points: isDevelopment ? 200 : 5,
        duration: 15 * 60,
        blockDuration: isDevelopment ? 60 : 15 * 60,
      });

const authRateLimit = createRateLimitMiddleware(AuthRateLimiter, "Auth");

// ✅ SECURITY: Stricter rate limit cho signin (brute force protection)
// Tăng rate limit cho development environment để dễ test
const SignInRateLimiter =
  redisClient && redisClient.status === "ready"
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl:signin",
        points: isDevelopment ? 100 : 3, // 100 attempts in dev, 3 in production
        duration: 15 * 60, // per 15 minutes
        blockDuration: isDevelopment ? 60 : 15 * 60, // 1 min in dev, 15 min in production
      })
    : new RateLimiterMemory({
        keyPrefix: "rl:signin",
        points: isDevelopment ? 100 : 3,
        duration: 15 * 60,
        blockDuration: isDevelopment ? 60 : 15 * 60,
      });

const signInRateLimit = createRateLimitMiddleware(SignInRateLimiter, "SignIn");

// Public routes for authentication
// ✅ SECURITY: Rate limiting applied to prevent brute force attacks
// ✅ NEW: Google OAuth2 authorization code flow (modern, no popup needed)
router.post("/google/verify", authController.verifyGoogleCode);
// ✅ OLD: Google ID token verification (backward compatibility)
router.post("/google-verify", authController.verifyGoogleToken);
router.post("/signup", authRateLimit, authController.signUp);
router.post("/signin", signInRateLimit, authController.signIn);
router.post("/signout", authController.signOut);
router.post("/refresh", authController.refresh);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/resend-verification",
  authRateLimit,
  authController.resendVerificationEmail
);

// ✅ Pusher Authentication (Bắt buộc phải có protect để lấy req.user)
router.post("/pusher/auth", protect, pusherController.authenticate);

export default router;
