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
      role: req.user.role,
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
 * Should be placed after all routes but before final error handler
 */
export const sentryErrorMiddleware = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors except 404s
    return error.status !== 404;
  },
});
