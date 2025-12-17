// packages/auth/index.js
// ✅ SHARED: Main export file for auth package

// Models
export { default as Session } from "./models/session.model.js";

// Services
export { TokenService, createTokenService } from "./services/token.service.js";
export {
  SessionService,
  createSessionService,
} from "./services/session.service.js";

// Middleware
export {
  createAuthMiddleware,
  createRoleMiddleware,
} from "./middleware/auth.middleware.js";

// ✅ CONVENIENCE: Pre-configured factories
export const createCustomerAuth = (config, getUserById) =>
  createAuthMiddleware(config, getUserById, "customer");

export const createAdminAuth = (config, getUserById) =>
  createAuthMiddleware(config, getUserById, "admin");
