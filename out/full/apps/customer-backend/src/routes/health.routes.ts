// Health check endpoint for monitoring
import express from "express";
import mongoose from "mongoose";
import { getRedisClient } from "../infrastructure/cache/redis.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "customer-backend",
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: "unknown",
      redis: "unknown",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    },
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.checks.database = "ok";
    } else {
      health.checks.database = "error";
      health.status = "degraded";
    }

    // Check Redis connection
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.ping();
        health.checks.redis = "ok";
      } else {
        health.checks.redis = "not available";
        health.status = "degraded";
      }
    } catch (redisError) {
      health.checks.redis = "error";
      health.status = "degraded";
    }
  } catch (error) {
    health.checks.database = "error";
    health.status = "error";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

// Liveness probe - simple check if server is running
router.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// Readiness probe - check if server is ready to accept traffic
router.get("/health/ready", async (req, res) => {
  try {
    // Check if database is connected
    const dbReady = mongoose.connection.readyState === 1;

    // Check if Redis is connected
    let redisReady = false;
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.ping();
        redisReady = true;
      }
    } catch (e) {
      // Redis not ready
    }

    if (dbReady && redisReady) {
      res.status(200).json({ status: "ready" });
    } else {
      res.status(503).json({
        status: "not ready",
        reasons: {
          database: dbReady ? "ok" : "not connected",
          redis: redisReady ? "ok" : "not connected",
        },
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(503).json({ status: "not ready", reason: errorMessage });
  }
});

export default router;
