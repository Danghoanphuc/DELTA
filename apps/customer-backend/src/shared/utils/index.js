// src/shared/utils/index.js

export * from "./api-response.util.js";
export * from "./logger.util.js";
export * from "./pricing.util.js";

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
