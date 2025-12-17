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
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// --- Import configuration ---
import { config } from "./config/env.config.js";
import { Logger } from "./utils/logger.js";

// --- Import Socket.IO middleware ---
import { socketAuthMiddleware } from "./middleware/socket-auth.middleware.js";

// --- Import shared models (register with mongoose) ---
import "./models/shared.models.js";
import "./models/delivery-thread.model.js";

// --- Import routes ---
import healthRoutes from "./routes/health.routes.js";
import adminAuthRoutes from "./routes/admin-auth.routes.js"; // ✅ STANDARDIZED: New auth routes
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
import catalogRoutes from "./routes/catalog.routes.js";
import adminSwagOpsRoutes from "./routes/admin.swag-operations.routes.js";
import adminInventoryRoutes from "./routes/admin.inventory.routes.js";
import adminProductionRoutes from "./routes/admin.production.routes.js";
import adminKittingRoutes from "./routes/admin.kitting.routes.js";
import adminDocumentRoutes from "./routes/admin.document.routes.js";
import adminAlertRoutes from "./routes/admin.alert.routes.js";
import adminSupplierRoutes from "./routes/admin.supplier.routes.js";
import supplierPostRoutes from "./routes/supplier-post.routes.js";
import publicMagazineRoutes from "./routes/public-magazine.routes.js";
import publicArtisanRoutes from "./routes/public-artisan.routes.js";
import publicCatalogRoutes from "./routes/public-catalog.routes.js";
import adminShippingRoutes from "./routes/admin.shipping.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import adminCostTrackingRoutes from "./routes/admin.cost-tracking.routes.js";
import adminPricingRoutes from "./routes/admin.pricing.routes.js";
import adminProposalRoutes from "./routes/admin.proposal.routes.js";
import adminAssetRoutes from "./routes/admin.asset.routes.js";
import adminProductionStatusRoutes from "./routes/admin.production-status.routes.js";
import adminJobTicketRoutes from "./routes/admin.job-ticket.routes.js";
import adminReorderRoutes from "./routes/admin.reorder.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import adminDeliveryCheckinRoutes from "./routes/admin.delivery-checkin.routes.js";
import adminDeliveryThreadRoutes from "./routes/admin.delivery-thread.routes.js";
import adminOrderThreadRoutes from "./routes/admin.order-thread.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";

const app = express();
const httpServer = createServer(app);

// --- ✅ REAL-TIME: Initialize Socket.IO ---
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origins,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Apply authentication middleware to Socket.IO
io.use(socketAuthMiddleware);

// Socket.IO connection handler
io.on("connection", (socket) => {
  Logger.success(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    Logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

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

// ✅ STANDARDIZATION: Add cookie parser for refresh token support
app.use(cookieParser());

// TODO: Import shared Session model when @delta/auth is properly configured
// import "../../../packages/auth/models/session.model.js";
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
app.use("/api/admin/auth", adminAuthRoutes); // ✅ STANDARDIZED: Using new auth routes
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
app.use("/api/admin/catalog", catalogRoutes);
app.use("/api/admin/swag-ops", adminSwagOpsRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/production-orders", adminProductionRoutes);
app.use("/api/admin/kitting", adminKittingRoutes);
app.use("/api/admin/documents", adminDocumentRoutes);
app.use("/api/admin/suppliers", adminSupplierRoutes);
app.use("/api/admin/supplier-posts", supplierPostRoutes);
app.use("/api/magazine", publicMagazineRoutes); // Public endpoint - no auth
app.use("/api/artisans", publicArtisanRoutes); // Public endpoint - no auth
app.use("/api", publicCatalogRoutes); // Public catalog - no auth (products, categories)
app.use("/api/admin/shipments", adminShippingRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/costs", adminCostTrackingRoutes);
app.use("/api/admin/pricing", adminPricingRoutes);
app.use("/api/admin/proposals", adminProposalRoutes);
app.use("/api/admin", adminAssetRoutes);
app.use("/api/production", adminProductionStatusRoutes);
app.use("/api/admin", adminJobTicketRoutes);
app.use("/api/orders", adminReorderRoutes);
app.use("/api/alerts", adminAlertRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin/delivery-checkins", adminDeliveryCheckinRoutes);
app.use("/api/admin/delivery-threads", adminDeliveryThreadRoutes);
app.use("/api/admin/order-threads", adminOrderThreadRoutes);
app.use("/api/admin/upload", uploadRoutes);

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
let server: ReturnType<typeof httpServer.listen>;

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    Logger.success("Connected to MongoDB");

    // Initialize cron jobs after DB connection
    initializeCronJobs();

    // Start HTTP server with Socket.IO
    server = httpServer.listen(config.port, () => {
      Logger.success(`Server running on http://localhost:${config.port}`);
      Logger.success(`Socket.IO server ready on ws://localhost:${config.port}`);
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
    // Close Socket.IO connections
    io.close(() => {
      Logger.info("Socket.IO server closed");
    });

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

process.on("unhandledRejection", (reason: any, promise) => {
  Logger.error("UNHANDLED REJECTION", { reason, promise });

  // Check if this is a recoverable network error (e.g., Cloudinary upload failure)
  // Don't shutdown server for transient network errors
  const errorCode = reason?.code || reason?.error?.code;
  const recoverableErrors = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EPIPE",
    "EAI_AGAIN",
  ];

  if (recoverableErrors.includes(errorCode)) {
    Logger.warn(
      `[Process] Recoverable network error (${errorCode}) - NOT shutting down server. ` +
        "This is likely a transient issue with external service."
    );
    return; // Don't shutdown for recoverable errors
  }

  // For other unhandled rejections, still shutdown to be safe
  gracefulShutdown("unhandledRejection");
});

// Start the server
startServer();
