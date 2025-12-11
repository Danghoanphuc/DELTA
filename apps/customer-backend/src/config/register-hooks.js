// apps/customer-backend/src/config/register-hooks.js
// ✅ Register Hooks - Central place to register all application hooks

import logger from "../infrastructure/logger.js";
import { SwagOrder } from "../modules/swag-orders/swag-order.model.js";
import { registerOrderThreadHooks } from "../middleware/order-thread-hooks.middleware.js";

/**
 * Register all application hooks
 * This should be called after database connection is established
 */
export function registerAllHooks() {
  logger.info("[RegisterHooks] Registering application hooks");

  try {
    // Register order-thread integration hooks
    registerOrderThreadHooks(SwagOrder);

    // TODO: Register design-thread integration hooks
    // registerDesignThreadHooks(Design);

    // TODO: Register other hooks as needed

    logger.info("[RegisterHooks] ✅ All hooks registered successfully");
  } catch (error) {
    logger.error("[RegisterHooks] Failed to register hooks:", error);
    throw error;
  }
}
