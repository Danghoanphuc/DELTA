// apps/admin-backend/src/shared/middleware/index.ts
// Middleware exports

export { isAuthenticatedAdmin as authenticate } from "../../middleware/admin.auth.middleware.js";
export { hasRole } from "../../middleware/admin.auth.middleware.js";
export { errorHandler } from "../../middleware/error.handler.middleware.js";
export {
  createRateLimiter,
  authRateLimiter,
  sensitiveRateLimiter,
  generalRateLimiter,
} from "../../middleware/rate-limit.middleware.js";
export { processImage, resizeOnly } from "./image-processor.middleware.js";
