// apps/admin-backend/src/server.ts
// ✅ IMPORTANT: Import Sentry FIRST (before anything else)
import "./infrastructure/instrument.js";

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

// --- Import configuration ---
import { config } from "./config/env.config.js";
import { Logger } from "./utils/logger.js";

// --- Import routes ---
import healthRoutes from "./routes/health.routes.js";
import adminAuthRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.handler.middleware.js";
import { generalRateLimiter } from "./middleware/rate-limit.middleware.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminPrinterRoutes from "./routes/admin.printer.routes.js";
import tierRuleRoutes from "./routes/tier-rule.routes.js";
import { initializeCronJobs } from "./workers/index.js";
import adminProductRoutes from "./routes/admin.product.routes.js";
import adminManagementRoutes from "./routes/admin.management.routes.js";
import adminAuditLogRoutes from "./routes/admin.audit-log.routes.js";
import adminOrderRoutes from "./routes/admin.order.routes.js";
import adminFinanceRoutes from "./routes/admin.finance.routes.js";
import adminContentRoutes from "./routes/admin.content.routes.js";

const app = express();

// --- ✅ SECURITY FIX: Cấu hình Helmet với các security headers ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

// --- ✅ SECURITY FIX: CORS với origins từ env config ---
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (config.cors.origins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // ✅ Add limit to prevent payload attacks
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Skip logging for health checks to reduce noise
app.use(
  morgan(config.env === "production" ? "combined" : "dev", {
    skip: (req, res) => {
      // Skip health check endpoints
      if (req.url.startsWith("/health")) {
        return true;
      }
      // Skip 404s from bots/scanners
      if (res.statusCode === 404) {
        return true;
      }
      return false;
    },
  })
);

// --- ✅ MONITORING: Add Sentry handlers ---
Sentry.setupExpressErrorHandler(app);

// --- ✅ SECURITY: Apply general rate limiting to all routes ---
app.use(generalRateLimiter);

// --- ✅ IMPROVEMENT: Kết nối MongoDB với proper error handling ---
const MONGO_URI = config.db.connectionString;

// --- ✅ MONITORING: Health Check endpoints (đặt trước các routes khác) ---
app.use("/", healthRoutes);

// --- API Routes ---
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/printers", adminPrinterRoutes);
app.use("/api/admin/tier-rules", tierRuleRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/admins", adminManagementRoutes);
app.use("/api/admin/audit-logs", adminAuditLogRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/finance", adminFinanceRoutes);
app.use("/api/admin/content", adminContentRoutes);

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --- Error Handler (phải đặt cuối cùng) ---
app.use(errorHandler);

// --- ✅ IMPROVEMENT: Khởi động server với async pattern ---
let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    Logger.success("Connected to MongoDB");

    // Initialize cron jobs after DB connection
    initializeCronJobs();

    // Start HTTP server
    server = app.listen(config.port, () => {
      Logger.success(`Server running on http://localhost:${config.port}`);
      Logger.info(`Environment: ${config.env}`);
      Logger.info(`Health Check: http://localhost:${config.port}/health`);
    });
  } catch (err) {
    Logger.error("Failed to start server", err);
    process.exit(1);
  }
}

// --- ✅ IMPROVEMENT: Graceful Shutdown ---
const gracefulShutdown = async (signal: string) => {
  Logger.warn(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      Logger.info("HTTP server closed");
    });
  }

  try {
    // Close database connection
    await mongoose.connection.close();
    Logger.success("MongoDB connection closed");

    Logger.success("Graceful shutdown completed");
    process.exit(0);
  } catch (err) {
    Logger.error("Error during shutdown", err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  Logger.error("UNCAUGHT EXCEPTION", err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("UNHANDLED REJECTION", { reason, promise });
  gracefulShutdown("unhandledRejection");
});

// Start the server
startServer();
