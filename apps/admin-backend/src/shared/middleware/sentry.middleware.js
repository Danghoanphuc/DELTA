// ✅ Sentry Middleware for Admin Backend

import * as Sentry from "@sentry/node";
import {
  setSentryUser,
  clearSentryUser,
} from "../../infrastructure/sentry-utils.js";

/**
 * Middleware to set Sentry context for each request
 */
export function sentryContextMiddleware(req, res, next) {
  // Set user context if authenticated
  if (req.user) {
    setSentryUser(req.user);
  }

  // Add request context
  Sentry.setContext("request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Clear context after response
  res.on("finish", () => {
    if (req.user) {
      clearSentryUser();
    }
  });

  next();
}

/**
 * Error handler middleware (should be last)
 */
export function sentryErrorHandler(err, req, res, next) {
  // Capture error in Sentry
  Sentry.captureException(err, {
    tags: {
      path: req.path,
      method: req.method,
    },
    user: req.user
      ? {
          id: req.user._id?.toString(),
          username: req.user.username,
          email: req.user.email,
        }
      : undefined,
  });

  // Pass to next error handler
  next(err);
}
