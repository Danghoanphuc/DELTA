// ✅ Sentry Utility Functions for Manual Instrumentation
// Use these to add manual tracing for AI operations that are excluded from auto-instrumentation

import * as Sentry from "@sentry/node";
import { Logger } from "../shared/utils/index.js";

/**
 * Wrap AI streaming operations with Sentry tracing
 * @param {string} operationName - Name of the operation (e.g., "ai.chat.stream")
 * @param {Function} fn - Async function to execute
 * @param {Object} attributes - Additional attributes to attach to the span
 * @returns {Promise<any>}
 */
export async function traceAIOperation(operationName, fn, attributes = {}) {
  return await Sentry.startSpan(
    {
      name: operationName,
      op: "ai",
      attributes: {
        ...attributes,
        "ai.provider": "openai",
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1, message: "ok" }); // SUCCESS
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error.message }); // ERROR
        Sentry.captureException(error, {
          tags: {
            operation: operationName,
            component: "ai",
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Add breadcrumb for AI operations
 * @param {string} message - Breadcrumb message
 * @param {Object} data - Additional data
 */
export function addAIBreadcrumb(message, data = {}) {
  Sentry.addBreadcrumb({
    category: "ai",
    message,
    level: "info",
    data,
  });
}

/**
 * Track AI token usage
 * @param {Object} usage - Token usage data
 */
export function trackTokenUsage(usage) {
  if (!usage) return;

  Sentry.addBreadcrumb({
    category: "ai.tokens",
    message: "Token usage",
    level: "info",
    data: {
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
    },
  });

  // Also log for monitoring
  Logger.info("[AI Tokens]", {
    prompt: usage.promptTokens,
    completion: usage.completionTokens,
    total: usage.totalTokens,
  });
}

/**
 * Track tool calls in AI operations
 * @param {Array} toolCalls - Array of tool calls
 */
export function trackToolCalls(toolCalls) {
  if (!toolCalls || toolCalls.length === 0) return;

  toolCalls.forEach((toolCall) => {
    Sentry.addBreadcrumb({
      category: "ai.tool",
      message: `Tool called: ${toolCall.toolName}`,
      level: "info",
      data: {
        tool_name: toolCall.toolName,
        tool_call_id: toolCall.toolCallId,
        args: toolCall.args,
      },
    });
  });
}

/**
 * Set user context for Sentry
 * @param {Object} user - User object
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
 * Clear user context (e.g., on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom tags to current scope
 * @param {Object} tags - Tags to add
 */
export function addSentryTags(tags) {
  Sentry.setTags(tags);
}

/**
 * Capture custom metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} tags - Additional tags
 */
export function captureMetric(name, value, tags = {}) {
  Sentry.metrics.gauge(name, value, {
    tags,
  });
}
