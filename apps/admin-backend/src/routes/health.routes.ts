// Health check endpoint for monitoring
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "admin-backend",
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: "unknown",
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
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({ status: "ready" });
    } else {
      res
        .status(503)
        .json({ status: "not ready", reason: "database not connected" });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(503).json({ status: "not ready", reason: errorMessage });
  }
});

export default router;
