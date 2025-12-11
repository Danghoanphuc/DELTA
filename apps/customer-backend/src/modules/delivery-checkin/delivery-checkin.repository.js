// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.repository.js
/**
 * Delivery Check-in Repository
 *
 * Data access layer cho DeliveryCheckin.
 * Hỗ trợ polymorphic order references (SwagOrder, MasterOrder).
 *
 * @module DeliveryCheckinRepository
 */

import { DeliveryCheckin } from "./delivery-checkin.model.js";
import { orderResolverService } from "../../shared/services/order-resolver.service.js";
import { ORDER_TYPE_TO_MODEL } from "../../shared/constants/order-types.constant.js";

export class DeliveryCheckinRepository {
  /**
   * Create a new delivery check-in
   * @param {Object} data - Check-in data (must include orderType)
   * @returns {Promise<Object>} Created check-in
   */
  async create(data) {
    // Ensure orderModel is set from orderType
    if (data.orderType && !data.orderModel) {
      data.orderModel = ORDER_TYPE_TO_MODEL[data.orderType];
    }

    const checkin = new DeliveryCheckin(data);
    return await checkin.save();
  }

  /**
   * Find check-in by ID with shipper info
   * Note: Order info is denormalized (orderNumber), no need to populate orderId
   * @param {string} id - Check-in ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return await DeliveryCheckin.findById(id)
      .populate("shipperId", "displayName avatarUrl email")
      .lean();
  }

  /**
   * Find check-in by ID with full order details
   * Uses OrderResolverService for polymorphic order lookup
   * @param {string} id - Check-in ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithOrder(id) {
    const checkin = await this.findById(id);
    if (!checkin) return null;

    // Resolve order using polymorphic resolver
    const order = await orderResolverService.resolveById(
      checkin.orderId,
      checkin.orderType
    );

    return {
      ...checkin,
      order, // Normalized order data
    };
  }

  /**
   * Find check-ins by order ID and type
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type (optional, for filtering)
   * @returns {Promise<Array>}
   */
  async findByOrder(orderId, orderType = null) {
    return await DeliveryCheckin.findByOrder(orderId, orderType);
  }

  /**
   * Find check-ins by shipper ID
   * @param {string} shipperId - Shipper ID
   * @param {Object} options - Query options { limit, orderType }
   * @returns {Promise<Array>}
   */
  async findByShipper(shipperId, options = {}) {
    return await DeliveryCheckin.findByShipper(shipperId, options);
  }

  /**
   * Find check-ins by customer ID
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options { limit, orderType }
   * @returns {Promise<Array>}
   */
  async findByCustomer(customerId, options = {}) {
    return await DeliveryCheckin.findByCustomer(customerId, options);
  }

  /**
   * Find check-ins within geographic bounds
   * @param {Object} bounds - Geographic bounds { minLng, minLat, maxLng, maxLat }
   * @param {Object} options - Query options { orderType, customerId }
   * @returns {Promise<Array>}
   */
  async findWithinBounds(bounds, options = {}) {
    return await DeliveryCheckin.findWithinBounds(bounds, options);
  }

  /**
   * Find check-ins with pagination
   * @param {Object} filter - Query filter
   * @param {Object} options - Pagination options { page, limit, sort }
   * @returns {Promise<{ checkins: Array, pagination: Object }>}
   */
  async findWithPagination(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { checkinAt: -1 } } = options;

    const skip = (page - 1) * limit;
    const query = { ...filter, isDeleted: false };

    const [checkins, total] = await Promise.all([
      DeliveryCheckin.find(query)
        .populate("shipperId", "displayName avatarUrl email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      DeliveryCheckin.countDocuments(query),
    ]);

    return {
      checkins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Soft delete a check-in
   * @param {string} id - Check-in ID
   * @param {string} userId - User ID performing deletion
   * @returns {Promise<Object|null>}
   */
  async delete(id, userId) {
    const existing = await DeliveryCheckin.findById(id);
    if (!existing || existing.isDeleted) {
      return existing;
    }

    return await DeliveryCheckin.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      { new: true }
    );
  }

  /**
   * Update check-in status
   * @param {string} id - Check-in ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, status) {
    return await DeliveryCheckin.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  /**
   * Mark email as sent
   * @param {string} id - Check-in ID
   * @returns {Promise<Object|null>}
   */
  async markEmailSent(id) {
    return await DeliveryCheckin.findByIdAndUpdate(
      id,
      {
        emailSent: true,
        emailSentAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Update thread ID
   * @param {string} id - Check-in ID
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object|null>}
   */
  async updateThreadId(id, threadId) {
    return await DeliveryCheckin.findByIdAndUpdate(
      id,
      { threadId },
      { new: true }
    );
  }

  /**
   * Count check-ins by filter
   * @param {Object} filter - Query filter
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await DeliveryCheckin.countDocuments({
      ...filter,
      isDeleted: false,
    });
  }

  /**
   * Count check-ins grouped by order type
   * @returns {Promise<Array>}
   */
  async countByOrderType() {
    return await DeliveryCheckin.countByOrderType();
  }

  /**
   * Check if check-in exists for order
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type
   * @returns {Promise<boolean>}
   */
  async existsForOrder(orderId, orderType) {
    const count = await DeliveryCheckin.countDocuments({
      orderId,
      orderType,
      isDeleted: false,
    });
    return count > 0;
  }
}
