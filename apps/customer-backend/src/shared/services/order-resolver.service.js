// apps/customer-backend/src/shared/services/order-resolver.service.js
/**
 * Order Resolver Service
 *
 * Service để resolve order từ bất kỳ type nào (SwagOrder, MasterOrder).
 * Implements Strategy Pattern cho polymorphic order handling.
 *
 * @module OrderResolverService
 */

import mongoose from "mongoose";
import {
  ORDER_TYPES,
  ORDER_TYPE_TO_MODEL,
  detectOrderTypeFromNumber,
  isValidOrderType,
} from "../constants/order-types.constant.js";
import logger from "../../infrastructure/logger.js";

const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
};

/**
 * Normalized Order Interface
 * Chuẩn hóa data từ các loại order khác nhau
 * @typedef {Object} NormalizedOrder
 * @property {string} _id - Order ID
 * @property {string} orderNumber - Order number
 * @property {string} orderType - Order type (swag/master)
 * @property {string} status - Order status (normalized)
 * @property {string} customerId - Customer user ID
 * @property {string} customerName - Customer name
 * @property {string} customerEmail - Customer email
 * @property {Object} shippingAddress - Shipping address
 * @property {Date} createdAt - Created timestamp
 */

class OrderResolverService {
  constructor() {
    // Lazy load models to avoid circular dependencies
    this._models = {};
  }

  /**
   * Get model by order type (lazy loading)
   * @private
   */
  _getModel(orderType) {
    const modelName = ORDER_TYPE_TO_MODEL[orderType];
    if (!modelName) {
      throw new Error(`Unknown order type: ${orderType}`);
    }

    if (!this._models[modelName]) {
      try {
        this._models[modelName] = mongoose.model(modelName);
      } catch (error) {
        Logger.error(
          `[OrderResolver] Model ${modelName} not registered:`,
          error.message
        );
        throw new Error(
          `Model ${modelName} is not registered. Ensure it's imported before use.`
        );
      }
    }

    return this._models[modelName];
  }

  /**
   * Resolve order by ID and type
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type (swag/master)
   * @param {Object} options - Query options
   * @returns {Promise<NormalizedOrder|null>}
   */
  async resolveById(orderId, orderType, options = {}) {
    if (!isValidOrderType(orderType)) {
      Logger.warn(`[OrderResolver] Invalid order type: ${orderType}`);
      return null;
    }

    try {
      const Model = this._getModel(orderType);
      const order = await Model.findById(orderId).lean();

      if (!order) {
        return null;
      }

      return this._normalizeOrder(order, orderType);
    } catch (error) {
      Logger.error(
        `[OrderResolver] Error resolving order ${orderId}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Resolve order by order number (auto-detect type)
   * @param {string} orderNumber - Order number
   * @returns {Promise<NormalizedOrder|null>}
   */
  async resolveByOrderNumber(orderNumber) {
    const orderType = detectOrderTypeFromNumber(orderNumber);

    if (!orderType) {
      Logger.warn(
        `[OrderResolver] Cannot detect order type from: ${orderNumber}`
      );
      // Try both models
      return await this._tryResolveFromAllModels(orderNumber);
    }

    try {
      const Model = this._getModel(orderType);
      const order = await Model.findOne({ orderNumber }).lean();

      if (!order) {
        return null;
      }

      return this._normalizeOrder(order, orderType);
    } catch (error) {
      Logger.error(
        `[OrderResolver] Error resolving order ${orderNumber}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Try to resolve order from all models (fallback)
   * @private
   */
  async _tryResolveFromAllModels(orderNumber) {
    for (const orderType of Object.values(ORDER_TYPES)) {
      try {
        const Model = this._getModel(orderType);
        const order = await Model.findOne({ orderNumber }).lean();
        if (order) {
          return this._normalizeOrder(order, orderType);
        }
      } catch (error) {
        // Continue to next model
      }
    }
    return null;
  }

  /**
   * Normalize order data from different models
   * @private
   */
  _normalizeOrder(order, orderType) {
    const normalized = {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderType,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    // Normalize based on order type
    switch (orderType) {
      case ORDER_TYPES.SWAG:
        return this._normalizeSwagOrder(order, normalized);
      case ORDER_TYPES.MASTER:
        return this._normalizeMasterOrder(order, normalized);
      default:
        return normalized;
    }
  }

  /**
   * Normalize SwagOrder
   * @private
   */
  _normalizeSwagOrder(order, base) {
    return {
      ...base,
      status: order.status,
      paymentStatus: order.paymentStatus,
      // SwagOrder uses organization, not direct customer
      organizationId: order.organization,
      createdBy: order.createdBy,
      // For delivery, we need recipient info from recipientShipments
      totalRecipients: order.totalRecipients || 0,
      shippingMethod: order.shippingMethod,
      // Original data for reference
      _original: order,
    };
  }

  /**
   * Normalize MasterOrder
   * @private
   */
  _normalizeMasterOrder(order, base) {
    return {
      ...base,
      status: order.masterStatus,
      paymentStatus: order.paymentStatus,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      assignedShipperId: order.assignedShipperId,
      shipperAssignedAt: order.shipperAssignedAt,
      // Original data for reference
      _original: order,
    };
  }

  /**
   * Get customer info for an order
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type
   * @returns {Promise<Object|null>} Customer info { customerId, customerName, customerEmail }
   */
  async getCustomerInfo(orderId, orderType) {
    const order = await this.resolveById(orderId, orderType);
    if (!order) return null;

    if (orderType === ORDER_TYPES.MASTER) {
      return {
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      };
    }

    // For SwagOrder, customer info is in organization/createdBy
    // This would need additional lookup
    return {
      customerId: order.createdBy,
      customerName: null, // Would need User lookup
      customerEmail: null, // Would need User lookup
    };
  }

  /**
   * Check if order exists
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type
   * @returns {Promise<boolean>}
   */
  async exists(orderId, orderType) {
    if (!isValidOrderType(orderType)) return false;

    try {
      const Model = this._getModel(orderType);
      const count = await Model.countDocuments({ _id: orderId });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get basic order info for display (lightweight)
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type
   * @returns {Promise<Object|null>}
   */
  async getBasicInfo(orderId, orderType) {
    if (!isValidOrderType(orderType)) return null;

    try {
      const Model = this._getModel(orderType);

      // Select only essential fields
      const selectFields =
        orderType === ORDER_TYPES.SWAG
          ? "orderNumber status paymentStatus"
          : "orderNumber masterStatus paymentStatus customerName";

      const order = await Model.findById(orderId).select(selectFields).lean();

      if (!order) return null;

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderType,
        status: order.status || order.masterStatus,
        paymentStatus: order.paymentStatus,
      };
    } catch (error) {
      Logger.error(
        `[OrderResolver] Error getting basic info for ${orderId}:`,
        error.message
      );
      return null;
    }
  }
}

// Export singleton instance
export const orderResolverService = new OrderResolverService();

// Export class for testing
export { OrderResolverService };
