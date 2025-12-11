// apps/customer-backend/src/modules/delivery-checkin/security.service.js

import {
  UnauthorizedException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import logger from "../../infrastructure/logger.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

/**
 * SecurityService
 *
 * Handles security and privacy controls for the Delivery Check-in System.
 *
 * Features:
 * - Photo access control for authenticated users only
 * - GPS coordinate privacy for unauthorized users
 * - Customer order ownership verification
 * - HTTPS enforcement in production
 *
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.5**
 */
export class SecurityService {
  constructor() {
    // GPS coordinate precision levels
    this.GPS_PRECISION = {
      FULL: "full", // Full precision for authorized users
      APPROXIMATE: "approximate", // Reduced precision for limited access
      HIDDEN: "hidden", // No coordinates for unauthorized users
    };

    // Approximate precision reduces to ~1km accuracy (2 decimal places)
    this.APPROXIMATE_DECIMAL_PLACES = 2;
  }

  /**
   * Verify photo access control
   * Only authenticated users can access check-in photos
   *
   * **Feature: delivery-checkin-system, Property 45: Photo Access Control**
   * **Validates: Requirements 13.2**
   *
   * @param {Object} user - User object from request
   * @param {Object} checkin - Check-in object with photos
   * @returns {boolean} - True if user can access photos
   * @throws {UnauthorizedException} - If user is not authenticated
   */
  verifyPhotoAccess(user, checkin) {
    // Check if user is authenticated
    if (!user || !user._id) {
      Logger.debug(`[SecuritySvc] Photo access denied: User not authenticated`);
      throw new UnauthorizedException("Yêu cầu đăng nhập để xem ảnh giao hàng");
    }

    // Admin can access all photos
    if (user.isAdmin) {
      return true;
    }

    // Shipper can access photos of their own check-ins
    if (user.shipperProfileId) {
      const checkinShipperId = checkin.shipperId?._id
        ? checkin.shipperId._id.toString()
        : checkin.shipperId?.toString();

      if (checkinShipperId === user._id.toString()) {
        return true;
      }
    }

    // Customer can access photos of check-ins for their orders
    if (user.customerProfileId) {
      const checkinCustomerId = checkin.customerId?._id
        ? checkin.customerId._id.toString()
        : checkin.customerId?.toString();

      if (checkinCustomerId === user._id.toString()) {
        return true;
      }
    }

    // If user is authenticated but doesn't have access to this specific check-in
    // They can still see the check-in exists but not the photos
    Logger.debug(
      `[SecuritySvc] Photo access denied for user ${user._id} on check-in ${checkin._id}`
    );
    return false;
  }

  /**
   * Sanitize GPS coordinates based on user authorization level
   * Unauthorized users should not see exact GPS coordinates
   *
   * **Feature: delivery-checkin-system, Property 46: GPS Coordinate Privacy**
   * **Validates: Requirements 13.3**
   *
   * @param {Object} user - User object from request
   * @param {Object} checkin - Check-in object with location
   * @returns {Object} - Check-in with sanitized coordinates
   */
  sanitizeGPSCoordinates(user, checkin) {
    // If no user, hide coordinates completely
    if (!user || !user._id) {
      return this.hideCoordinates(checkin);
    }

    // Admin gets full precision
    if (user.isAdmin) {
      return checkin;
    }

    // Shipper gets full precision for their own check-ins
    if (user.shipperProfileId) {
      const checkinShipperId = checkin.shipperId?._id
        ? checkin.shipperId._id.toString()
        : checkin.shipperId?.toString();

      if (checkinShipperId === user._id.toString()) {
        return checkin;
      }
    }

    // Customer gets full precision for their orders
    if (user.customerProfileId) {
      const checkinCustomerId = checkin.customerId?._id
        ? checkin.customerId._id.toString()
        : checkin.customerId?.toString();

      if (checkinCustomerId === user._id.toString()) {
        return checkin;
      }
    }

    // For other authenticated users, provide approximate coordinates
    return this.approximateCoordinates(checkin);
  }

  /**
   * Hide GPS coordinates completely
   * @param {Object} checkin - Check-in object
   * @returns {Object} - Check-in with hidden coordinates
   * @private
   */
  hideCoordinates(checkin) {
    const sanitized = { ...checkin };

    if (sanitized.location) {
      sanitized.location = {
        type: "Point",
        coordinates: [0, 0], // Hidden
        hidden: true,
      };
    }

    if (sanitized.gpsMetadata) {
      sanitized.gpsMetadata = {
        ...sanitized.gpsMetadata,
        accuracy: null,
        altitude: null,
        heading: null,
        speed: null,
        hidden: true,
      };
    }

    Logger.debug(
      `[SecuritySvc] GPS coordinates hidden for check-in ${checkin._id}`
    );
    return sanitized;
  }

  /**
   * Reduce GPS coordinate precision to approximate location (~1km)
   * @param {Object} checkin - Check-in object
   * @returns {Object} - Check-in with approximate coordinates
   * @private
   */
  approximateCoordinates(checkin) {
    const sanitized = { ...checkin };

    if (sanitized.location && sanitized.location.coordinates) {
      const [lng, lat] = sanitized.location.coordinates;
      sanitized.location = {
        type: "Point",
        coordinates: [
          this.roundToDecimalPlaces(lng, this.APPROXIMATE_DECIMAL_PLACES),
          this.roundToDecimalPlaces(lat, this.APPROXIMATE_DECIMAL_PLACES),
        ],
        approximate: true,
      };
    }

    if (sanitized.gpsMetadata) {
      sanitized.gpsMetadata = {
        ...sanitized.gpsMetadata,
        accuracy: null, // Hide accuracy
        altitude: null, // Hide altitude
        heading: null, // Hide heading
        speed: null, // Hide speed
        approximate: true,
      };
    }

    Logger.debug(
      `[SecuritySvc] GPS coordinates approximated for check-in ${checkin._id}`
    );
    return sanitized;
  }

  /**
   * Round number to specified decimal places
   * @param {number} num - Number to round
   * @param {number} places - Decimal places
   * @returns {number} - Rounded number
   * @private
   */
  roundToDecimalPlaces(num, places) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
  }

  /**
   * Verify customer owns the order
   *
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 13.5**
   *
   * @param {string} customerId - Customer user ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order if customer owns it
   * @throws {ForbiddenException} - If customer doesn't own the order
   */
  async verifyCustomerOrderOwnership(customerId, orderId) {
    const order = await MasterOrder.findById(orderId);

    if (!order) {
      Logger.debug(`[SecuritySvc] Order ${orderId} not found`);
      return null;
    }

    const orderCustomerId = order.customerId?._id
      ? order.customerId._id.toString()
      : order.customerId?.toString();

    if (orderCustomerId !== customerId.toString()) {
      Logger.debug(
        `[SecuritySvc] Customer ${customerId} does not own order ${orderId}`
      );
      throw new ForbiddenException("Bạn không có quyền truy cập đơn hàng này");
    }

    return order;
  }

  /**
   * Sanitize check-in data for response based on user authorization
   * Combines photo access control and GPS privacy
   *
   * @param {Object} user - User object from request
   * @param {Object} checkin - Check-in object
   * @returns {Object} - Sanitized check-in
   */
  sanitizeCheckinForResponse(user, checkin) {
    let sanitized = { ...checkin };

    // Sanitize GPS coordinates
    sanitized = this.sanitizeGPSCoordinates(user, sanitized);

    // Check photo access
    const canAccessPhotos = this.verifyPhotoAccessSafe(user, checkin);
    if (!canAccessPhotos) {
      // Hide photo URLs but keep count
      sanitized.photos = (checkin.photos || []).map((photo) => ({
        thumbnailUrl: null,
        url: null,
        restricted: true,
        filename: photo.filename,
      }));
      sanitized.photosRestricted = true;
    }

    return sanitized;
  }

  /**
   * Safe version of verifyPhotoAccess that returns boolean instead of throwing
   * @param {Object} user - User object
   * @param {Object} checkin - Check-in object
   * @returns {boolean} - True if user can access photos
   */
  verifyPhotoAccessSafe(user, checkin) {
    try {
      return this.verifyPhotoAccess(user, checkin);
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize multiple check-ins for response
   * @param {Object} user - User object
   * @param {Array} checkins - Array of check-in objects
   * @returns {Array} - Array of sanitized check-ins
   */
  sanitizeCheckinsForResponse(user, checkins) {
    return checkins.map((checkin) =>
      this.sanitizeCheckinForResponse(user, checkin)
    );
  }
}
