// apps/admin-backend/src/middleware/error.handler.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.config.js";
import { Logger } from "../shared/utils/logger.js";

// ✅ IMPROVEMENT: Middleware bắt lỗi với proper logging và error handling
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ không xác định";

  // ✅ SECURITY FIX: Log detailed errors in development, sanitized in production
  if (config.env === "development") {
    Logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`, err);
  } else {
    // Production: log less detail to avoid leaking information
    Logger.error(`${req.method} ${req.path} - ${statusCode}`);
  }

  // ✅ SECURITY FIX: Don't leak stack traces or internal details in production
  const response: any = {
    success: false,
    status: statusCode,
    message:
      config.env === "production" && statusCode === 500
        ? "Có lỗi xảy ra, vui lòng thử lại sau"
        : message,
  };

  // Only include stack trace in development
  if (config.env === "development" && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
