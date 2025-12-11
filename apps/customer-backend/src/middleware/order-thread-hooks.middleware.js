// apps/customer-backend/src/middleware/order-thread-hooks.middleware.js
// ✅ Order Thread Hooks Middleware - Mongoose middleware for order-thread integration

import logger from "../infrastructure/logger.js";
import { OrderIntegrationService } from "../services/order-integration.service.js";

const orderIntegrationService = new OrderIntegrationService();

/**
 * Post-save hook for SwagOrder
 * Triggers thread creation when order is created
 */
export async function onOrderCreatedHook(doc) {
  try {
    // Only create thread for new orders (not updates)
    if (doc.isNew) {
      logger.debug(
        `[OrderThreadHooks] Order created: ${doc.orderNumber}, creating thread`
      );
      await orderIntegrationService.onOrderCreated(doc);
    }
  } catch (error) {
    // Log error but don't fail the order creation
    logger.error(
      `[OrderThreadHooks] Failed to create thread for order ${doc.orderNumber}:`,
      error
    );
  }
}

/**
 * Pre-save hook for SwagOrder
 * Detects status changes and triggers thread updates
 */
export async function onOrderStatusChangeHook(next) {
  try {
    // Check if status changed
    if (this.isModified("status")) {
      const oldStatus = this._original?.status;
      const newStatus = this.status;

      if (oldStatus && oldStatus !== newStatus) {
        logger.debug(
          `[OrderThreadHooks] Order ${this.orderNumber} status changed: ${oldStatus} → ${newStatus}`
        );

        // Store status change info for post-save hook
        this._statusChanged = {
          oldStatus,
          newStatus,
        };
      }
    }

    next();
  } catch (error) {
    logger.error(
      `[OrderThreadHooks] Error in pre-save hook for order ${this.orderNumber}:`,
      error
    );
    next(error);
  }
}

/**
 * Post-save hook for status changes
 * Posts system message to thread
 */
export async function onOrderStatusChangedPostHook(doc) {
  try {
    // Check if status was changed
    if (doc._statusChanged) {
      const { oldStatus, newStatus } = doc._statusChanged;

      logger.debug(
        `[OrderThreadHooks] Posting status change to thread for order ${doc.orderNumber}`
      );

      await orderIntegrationService.onOrderStatusChanged(
        doc,
        oldStatus,
        newStatus
      );

      // Clean up temporary flag
      delete doc._statusChanged;
    }
  } catch (error) {
    // Log error but don't fail the order update
    logger.error(
      `[OrderThreadHooks] Failed to post status change for order ${doc.orderNumber}:`,
      error
    );
  }
}

/**
 * Pre-findOneAndUpdate hook
 * Stores original document for comparison
 */
export async function onOrderPreUpdateHook(next) {
  try {
    // Get the original document before update
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
      this._original = docToUpdate.toObject();
    }
    next();
  } catch (error) {
    logger.error("[OrderThreadHooks] Error in pre-update hook:", error);
    next(error);
  }
}

/**
 * Post-findOneAndUpdate hook
 * Detects status changes and triggers thread updates
 */
export async function onOrderPostUpdateHook(doc) {
  try {
    if (!doc) return;

    // Check if status changed
    const oldStatus = this._original?.status;
    const newStatus = doc.status;

    if (oldStatus && oldStatus !== newStatus) {
      logger.debug(
        `[OrderThreadHooks] Order ${doc.orderNumber} status changed via update: ${oldStatus} → ${newStatus}`
      );

      await orderIntegrationService.onOrderStatusChanged(
        doc,
        oldStatus,
        newStatus
      );
    }
  } catch (error) {
    // Log error but don't fail the update
    logger.error(
      `[OrderThreadHooks] Failed to handle post-update for order ${doc?.orderNumber}:`,
      error
    );
  }
}

/**
 * Register all hooks on SwagOrder model
 * @param {Model} SwagOrderModel - Mongoose model
 */
export function registerOrderThreadHooks(SwagOrderModel) {
  logger.info("[OrderThreadHooks] Registering order-thread integration hooks");

  // Post-save hook for new orders
  SwagOrderModel.schema.post("save", onOrderCreatedHook);

  // Pre-save hook for status changes
  SwagOrderModel.schema.pre("save", onOrderStatusChangeHook);

  // Post-save hook for status changes
  SwagOrderModel.schema.post("save", onOrderStatusChangedPostHook);

  // Pre-update hook to store original document
  SwagOrderModel.schema.pre("findOneAndUpdate", onOrderPreUpdateHook);

  // Post-update hook for status changes
  SwagOrderModel.schema.post("findOneAndUpdate", onOrderPostUpdateHook);

  logger.info("[OrderThreadHooks] ✅ Order-thread hooks registered");
}
