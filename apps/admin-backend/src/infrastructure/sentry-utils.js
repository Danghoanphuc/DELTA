// ✅ Sentry Utility Functions for Admin Backend

import * as Sentry from "@sentry/node";

/**
 * Trace async operations with Sentry
 */
export async function traceOperation(operationName, fn, attributes = {}) {
  return await Sentry.startSpan(
    {
      name: operationName,
      op: "function",
      attributes,
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1, message: "ok" });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error.message });
        Sentry.captureException(error, {
          tags: {
            operation: operationName,
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message, data = {}, category = "custom") {
  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data,
  });
}

/**
 * Set user context
 */
export function setSentryUser(user) {
  if (!user) return;

  Sentry.setUser({
    id: user._id?.toString() || user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom tags
 */
export function addSentryTags(tags) {
  Sentry.setTags(tags);
}

/**
 * Capture custom metric
 */
export function captureMetric(name, value, tags = {}) {
  Sentry.metrics.gauge(name, value, { tags });
}

export { Sentry };
