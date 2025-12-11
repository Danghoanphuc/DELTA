// ✅ Sentry Middleware - Automatically set context for all requests
import * as Sentry from "@sentry/node";

/**
 * Middleware to set Sentry context for authenticated requests
 */
export const sentryContextMiddleware = (req, res, next) => {
  // Set user context if authenticated
  if (req.user) {
    Sentry.setUser({
      id: req.user._id?.toString() || req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.getRole(),
    });
  }

  // Set request context
  Sentry.setContext("request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Add breadcrumb for request
  Sentry.addBreadcrumb({
    category: "http",
    message: `${req.method} ${req.originalUrl}`,
    level: "info",
    data: {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
    },
  });

  next();
};

/**
 * Error handler middleware for Sentry
 * NOTE: In Sentry v8, use Sentry.setupExpressErrorHandler(app) instead
 * This middleware is kept for backward compatibility but does nothing
 * The actual error handling is done by Sentry.setupExpressErrorHandler() in server.ts
 */
export const sentryErrorMiddleware = (req, res, next) => {
  // This is a no-op middleware
  // Actual Sentry error handling is done by Sentry.setupExpressErrorHandler(app)
  next();
};
