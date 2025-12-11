// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.repository.optimized.js
/**
 * Optimized Delivery Check-in Repository
 *
 * Provides optimized data access methods with:
 * - Query caching
 * - Efficient geospatial queries
 * - Pagination optimization
 * - Projection for reduced data transfer
 * - Polymorphic order reference support
 *
 * **Feature: delivery-checkin-system, Property 26: Geospatial Bounds Query**
 * **Validates: Requirements 7.6, 12.1, 12.5**
 */

import { DeliveryCheckin } from "./delivery-checkin.model.js";
import {
  performanceOptimizationService,
  PERFORMANCE_CONFIG,
} from "../../services/performance-optimization.service.js";
import { orderResolverService } from "../../shared/services/order-resolver.service.js";
import { ORDER_TYPE_TO_MODEL } from "../../shared/constants/order-types.constant.js";
import logger from "../../infrastructure/logger.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

/**
 * Projection fields for different use cases
 * Updated to include polymorphic reference fields
 */
const PROJECTIONS = {
  // Minimal projection for map markers
  mapMarker: {
    _id: 1,
    location: 1,
    orderNumber: 1,
    orderType: 1,
    shipperName: 1,
    "photos.thumbnailUrl": 1,
    checkinAt: 1,
    "address.formatted": 1,
  },

  // List view projection
  listView: {
    _id: 1,
    orderId: 1,
    orderNumber: 1,
    orderType: 1,
    orderModel: 1,
    shipperId: 1,
    shipperName: 1,
    customerId: 1,
    customerEmail: 1,
    location: 1,
    "address.formatted": 1,
    "photos.thumbnailUrl": 1,
    checkinAt: 1,
    status: 1,
    notes: 1,
  },

  // Full detail projection (all fields)
  full: null, // null means all fields
};

export class OptimizedDeliveryCheckinRepository {
  constructor() {
    this.cacheKeyPrefix = "checkin:";
  }

  /**
   * Find check-ins within geographic bounds with optimization
   * Supports polymorphic order type filtering
   *
   * **Feature: delivery-checkin-system, Property 26: Geospatial Bounds Query**
   * **Validates: Requirements 7.6, 12.3**
   *
   * @param {Object} bounds - Geographic bounds { minLng, minLat, maxLng, maxLat }
   * @param {Object} options - Query options { customerId, orderType, limit, projection, useCache }
   * @returns {Promise<Array>}
   */
  async findWithinBoundsOptimized(bounds, options = {}) {
    const {
      customerId = null,
      orderType = null,
      limit = PERFORMANCE_CONFIG.GEOSPATIAL_QUERY_LIMIT,
      projection = "mapMarker",
      useCache = true,
      cacheTTL = PERFORMANCE_CONFIG.CACHE_TTL_SHORT,
    } = options;

    const cacheKey = `${this.cacheKeyPrefix}bounds:${bounds.minLng}:${
      bounds.minLat
    }:${bounds.maxLng}:${bounds.maxLat}:${customerId || "all"}:${
      orderType || "all"
    }`;

    const fetcher = async () => {
      return await performanceOptimizationService.measureTime(
        "findWithinBoundsOptimized",
        async () => {
          // Build base filter
          const additionalFilters = { isDeleted: false };
          if (customerId) additionalFilters.customerId = customerId;
          if (orderType) additionalFilters.orderType = orderType;

          const query = performanceOptimizationService.buildGeospatialQuery(
            bounds,
            additionalFilters
          );

          const projectionFields =
            PROJECTIONS[projection] || PROJECTIONS.mapMarker;

          let queryBuilder = DeliveryCheckin.find(query);

          if (projectionFields) {
            queryBuilder = queryBuilder.select(projectionFields);
          }

          const results = await queryBuilder
            .sort({ checkinAt: -1 })
            .limit(limit)
            .lean()
            .hint({ location: "2dsphere" }); // Force use of geospatial index

          Logger.debug(
            `[OptimizedRepo] Found ${
              results.length
            } check-ins within bounds (orderType: ${orderType || "all"})`
          );

          return results;
        }
      );
    };

    if (useCache) {
      return await performanceOptimizationService.getCached(
        cacheKey,
        fetcher,
        cacheTTL
      );
    }

    return await fetcher();
  }

  /**
   * Find check-ins by customer with optimized pagination
   * Supports polymorphic order type filtering
   *
   * **Feature: delivery-checkin-system, Property 16: Customer Check-in Filtering**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   * **Validates: Requirements 5.1, 7.3**
   *
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options { page, limit, startDate, endDate, orderType, projection }
   * @returns {Promise<Object>} { checkins, pagination }
   */
  async findByCustomerOptimized(customerId, options = {}) {
    const optimizedOptions =
      performanceOptimizationService.optimizeQueryOptions(options);
    const {
      page,
      limit,
      startDate,
      endDate,
      orderType,
      projection = "listView",
    } = optimizedOptions;

    return await performanceOptimizationService.measureTime(
      "findByCustomerOptimized",
      async () => {
        const query = { customerId, isDeleted: false };

        // Add order type filter if provided
        if (orderType) {
          query.orderType = orderType;
        }

        // Add date range filter if provided
        if (startDate || endDate) {
          query.checkinAt = {};
          if (startDate) {
            query.checkinAt.$gte = new Date(startDate);
          }
          if (endDate) {
            query.checkinAt.$lte = new Date(endDate);
          }
        }

        const projectionFields =
          PROJECTIONS[projection] || PROJECTIONS.listView;
        const skip = (page - 1) * limit;

        // Execute count and find in parallel
        const [checkins, total] = await Promise.all([
          DeliveryCheckin.find(query)
            .select(projectionFields)
            .sort({ checkinAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          DeliveryCheckin.countDocuments(query),
        ]);

        Logger.debug(
          `[OptimizedRepo] Found ${
            checkins.length
          }/${total} check-ins for customer ${customerId} (orderType: ${
            orderType || "all"
          })`
        );

        return {
          checkins,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + checkins.length < total,
          },
        };
      }
    );
  }

  /**
   * Find check-ins by shipper with optimized pagination
   * Supports polymorphic order type filtering
   *
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   * **Validates: Requirements 9.5**
   *
   * @param {string} shipperId - Shipper ID
   * @param {Object} options - Query options { page, limit, startDate, endDate, status, orderType, projection }
   * @returns {Promise<Object>} { checkins, pagination }
   */
  async findByShipperOptimized(shipperId, options = {}) {
    const optimizedOptions =
      performanceOptimizationService.optimizeQueryOptions(options);
    const {
      page,
      limit,
      startDate,
      endDate,
      status,
      orderType,
      projection = "listView",
    } = optimizedOptions;

    return await performanceOptimizationService.measureTime(
      "findByShipperOptimized",
      async () => {
        const query = { shipperId, isDeleted: false };

        // Add order type filter
        if (orderType) {
          query.orderType = orderType;
        }

        // Add date range filter
        if (startDate || endDate) {
          query.checkinAt = {};
          if (startDate) {
            query.checkinAt.$gte = new Date(startDate);
          }
          if (endDate) {
            query.checkinAt.$lte = new Date(endDate);
          }
        }

        // Add status filter
        if (status && status !== "all") {
          query.status = status;
        }

        const projectionFields =
          PROJECTIONS[projection] || PROJECTIONS.listView;
        const skip = (page - 1) * limit;

        // Execute count and find in parallel
        const [checkins, total] = await Promise.all([
          DeliveryCheckin.find(query)
            .select(projectionFields)
            .sort({ checkinAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          DeliveryCheckin.countDocuments(query),
        ]);

        Logger.debug(
          `[OptimizedRepo] Found ${
            checkins.length
          }/${total} check-ins for shipper ${shipperId} (orderType: ${
            orderType || "all"
          })`
        );

        return {
          checkins,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + checkins.length < total,
          },
        };
      }
    );
  }

  /**
   * Find check-in by ID with caching
   * Uses OrderResolverService for polymorphic order lookup when needed
   *
   * @param {string} id - Check-in ID
   * @param {Object} options - Query options { useCache, cacheTTL, includeOrder }
   * @returns {Promise<Object|null>}
   */
  async findByIdOptimized(id, options = {}) {
    const {
      useCache = true,
      cacheTTL = PERFORMANCE_CONFIG.CACHE_TTL_MEDIUM,
      includeOrder = false,
    } = options;

    const cacheKey = `${this.cacheKeyPrefix}id:${id}:${
      includeOrder ? "withOrder" : "basic"
    }`;

    const fetcher = async () => {
      const checkin = await DeliveryCheckin.findById(id)
        .populate("shipperId", "displayName avatarUrl email")
        .lean();

      if (!checkin) return null;

      // If order details requested, resolve using polymorphic resolver
      if (includeOrder && checkin.orderType && checkin.orderId) {
        const order = await orderResolverService.resolveById(
          checkin.orderId,
          checkin.orderType
        );
        return { ...checkin, order };
      }

      return checkin;
    };

    if (useCache) {
      return await performanceOptimizationService.getCached(
        cacheKey,
        fetcher,
        cacheTTL
      );
    }

    return await fetcher();
  }

  /**
   * Invalidate cache for a check-in
   * @param {string} id - Check-in ID
   */
  invalidateCheckinCache(id) {
    performanceOptimizationService.invalidateCache(
      `${this.cacheKeyPrefix}id:${id}`
    );
    // Also invalidate bounds cache as it may contain this check-in
    performanceOptimizationService.invalidateCachePattern(
      `${this.cacheKeyPrefix}bounds:`
    );
  }

  /**
   * Get aggregated statistics for a customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Statistics
   */
  async getCustomerStats(customerId) {
    const cacheKey = `${this.cacheKeyPrefix}stats:customer:${customerId}`;

    return await performanceOptimizationService.getCached(
      cacheKey,
      async () => {
        const stats = await DeliveryCheckin.aggregate([
          { $match: { customerId, isDeleted: false } },
          {
            $group: {
              _id: null,
              totalCheckins: { $sum: 1 },
              firstCheckin: { $min: "$checkinAt" },
              lastCheckin: { $max: "$checkinAt" },
              uniqueOrders: { $addToSet: "$orderId" },
            },
          },
          {
            $project: {
              _id: 0,
              totalCheckins: 1,
              firstCheckin: 1,
              lastCheckin: 1,
              uniqueOrderCount: { $size: "$uniqueOrders" },
            },
          },
        ]);

        return (
          stats[0] || {
            totalCheckins: 0,
            firstCheckin: null,
            lastCheckin: null,
            uniqueOrderCount: 0,
          }
        );
      },
      PERFORMANCE_CONFIG.CACHE_TTL_MEDIUM
    );
  }

  /**
   * Get aggregated statistics for a shipper
   * @param {string} shipperId - Shipper ID
   * @returns {Promise<Object>} Statistics
   */
  async getShipperStats(shipperId) {
    const cacheKey = `${this.cacheKeyPrefix}stats:shipper:${shipperId}`;

    return await performanceOptimizationService.getCached(
      cacheKey,
      async () => {
        const stats = await DeliveryCheckin.aggregate([
          { $match: { shipperId, isDeleted: false } },
          {
            $group: {
              _id: null,
              totalCheckins: { $sum: 1 },
              firstCheckin: { $min: "$checkinAt" },
              lastCheckin: { $max: "$checkinAt" },
              uniqueOrders: { $addToSet: "$orderId" },
              uniqueCustomers: { $addToSet: "$customerId" },
            },
          },
          {
            $project: {
              _id: 0,
              totalCheckins: 1,
              firstCheckin: 1,
              lastCheckin: 1,
              uniqueOrderCount: { $size: "$uniqueOrders" },
              uniqueCustomerCount: { $size: "$uniqueCustomers" },
            },
          },
        ]);

        return (
          stats[0] || {
            totalCheckins: 0,
            firstCheckin: null,
            lastCheckin: null,
            uniqueOrderCount: 0,
            uniqueCustomerCount: 0,
          }
        );
      },
      PERFORMANCE_CONFIG.CACHE_TTL_MEDIUM
    );
  }
}

// Export singleton instance
export const optimizedDeliveryCheckinRepository =
  new OptimizedDeliveryCheckinRepository();
