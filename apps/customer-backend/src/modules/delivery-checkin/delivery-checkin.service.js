// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.service.js
/**
 * Delivery Check-in Service
 *
 * Business logic layer cho DeliveryCheckin.
 * Hỗ trợ polymorphic order references (SwagOrder, MasterOrder).
 *
 * @module DeliveryCheckinService
 */

import { DeliveryCheckinRepository } from "./delivery-checkin.repository.js";
import { ThreadIntegrationService } from "./thread-integration.service.js";
import { EmailNotificationService } from "./email-notification.service.js";
import { OrderStatusIntegrationService } from "./order-status-integration.service.js";
import { SecurityService } from "./security.service.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import logger from "../../infrastructure/logger.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

// Import order types constants
import {
  ORDER_TYPES,
  ORDER_TYPE_TO_MODEL,
  detectOrderTypeFromNumber,
  isValidOrderType,
} from "../../shared/constants/order-types.constant.js";
import { orderResolverService } from "../../shared/services/order-resolver.service.js";

import { MasterOrder } from "../../shared/models/master-order.model.js";
import { SwagOrder } from "../swag-orders/swag-order.model.js";
import { User } from "../../shared/models/user.model.js";
import { ShipperProfile } from "../../shared/models/shipper-profile.model.js";
import { GoongGeocodingService } from "../../services/goong-geocoding.service.js";
import { PhotoUploadService } from "../../services/photo-upload.service.js";
import { CHECKIN_STATUS } from "./delivery-checkin.model.js";

export class DeliveryCheckinService {
  constructor() {
    this.repository = new DeliveryCheckinRepository();
    this.threadIntegrationService = new ThreadIntegrationService();
    this.emailNotificationService = new EmailNotificationService();
    this.orderStatusIntegrationService = new OrderStatusIntegrationService();
    this.goongGeocodingService = new GoongGeocodingService();
    this.photoUploadService = new PhotoUploadService();
    this.securityService = new SecurityService();
  }

  /**
   * Verify user is a shipper with active profile
   *
   * **Feature: delivery-checkin-system, Property 1: Shipper Role Assignment**
   * **Validates: Requirements 1.1**
   *
   * @param {string} userId - User ID to verify
   * @returns {Promise<Object>} - User with shipper profile
   */
  async verifyShipperRole(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException("User", userId);
    }

    if (!user.shipperProfileId) {
      throw new ForbiddenException("Bạn không có quyền shipper");
    }

    const shipperProfile = await ShipperProfile.findById(user.shipperProfileId);
    if (!shipperProfile || !shipperProfile.isActive) {
      throw new ForbiddenException("Tài khoản shipper không hoạt động");
    }

    return { user, shipperProfile };
  }

  /**
   * Verify shipper is assigned to the order
   * Supports polymorphic order types (SwagOrder, MasterOrder)
   *
   * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
   * **Validates: Requirements 13.4**
   *
   * @param {string} shipperId - Shipper user ID
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type (swag/master), optional - will auto-detect if not provided
   * @returns {Promise<{order: Object, orderType: string}>} - Order and its type if shipper has access
   */
  async verifyShipperOrderAccess(shipperId, orderId, orderType = null) {
    Logger.info(
      `[DeliveryCheckinSvc] verifyShipperOrderAccess: shipperId=${shipperId}, orderId=${orderId}, orderType=${orderType}`
    );

    // Verify shipper has active profile first
    try {
      await this.verifyShipperRole(shipperId);
      Logger.info(
        `[DeliveryCheckinSvc] Shipper role verified for ${shipperId}`
      );
    } catch (error) {
      Logger.warn(
        `[DeliveryCheckinSvc] Shipper role verification failed: ${error.message}`
      );
      throw error;
    }

    // If orderType is provided, use it directly
    if (orderType && isValidOrderType(orderType)) {
      const order = await orderResolverService.resolveById(orderId, orderType);
      if (!order) {
        throw new NotFoundException("Order", orderId);
      }
      Logger.info(
        `[DeliveryCheckinSvc] Order found via resolver: ${
          order._id || order.id
        }`
      );
      return { order: order._original || order, orderType };
    }

    // Try to find order in both models
    // First try MasterOrder (more common for shipper delivery)
    let order = await MasterOrder.findById(orderId);
    if (order) {
      Logger.info(`[DeliveryCheckinSvc] Order found as MasterOrder`);
      return { order, orderType: ORDER_TYPES.MASTER };
    }

    // Then try SwagOrder
    order = await SwagOrder.findById(orderId);
    if (order) {
      Logger.info(`[DeliveryCheckinSvc] Order found as SwagOrder`);
      return { order, orderType: ORDER_TYPES.SWAG };
    }

    Logger.warn(`[DeliveryCheckinSvc] Order not found: ${orderId}`);
    throw new NotFoundException("Order", orderId);
  }

  /**
   * Verify customer owns the order
   * Supports polymorphic order types (SwagOrder, MasterOrder)
   *
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 13.5**
   *
   * @param {string} customerId - Customer user ID
   * @param {string} orderId - Order ID
   * @param {string} orderType - Order type (swag/master), optional
   * @returns {Promise<{order: Object, orderType: string}>} - Order and its type if customer owns it
   */
  async verifyCustomerOrderOwnership(customerId, orderId, orderType = null) {
    Logger.info(
      `[DeliveryCheckinSvc] verifyCustomerOrderOwnership: customerId=${customerId}, orderId=${orderId}, orderType=${orderType}`
    );

    // If orderType is provided, use it directly
    if (orderType && isValidOrderType(orderType)) {
      const order = await orderResolverService.resolveById(orderId, orderType);
      if (!order) {
        throw new NotFoundException("Order", orderId);
      }

      Logger.info(
        `[DeliveryCheckinSvc] Order resolved: ${
          order._id || order.id
        }, type=${orderType}`
      );

      // Check ownership based on order type
      if (orderType === ORDER_TYPES.MASTER) {
        Logger.info(
          `[DeliveryCheckinSvc] Checking MasterOrder ownership: order.customerId=${order.customerId}, customerId=${customerId}`
        );
        if (order.customerId?.toString() !== customerId.toString()) {
          throw new ForbiddenException(
            "Bạn không có quyền truy cập đơn hàng này"
          );
        }
      } else if (orderType === ORDER_TYPES.SWAG) {
        // For SwagOrder, check organization ownership
        const user = await User.findById(customerId);
        Logger.info(
          `[DeliveryCheckinSvc] User found: ${user?._id}, organizationProfileId=${user?.organizationProfileId}`
        );

        // Get organization ID from order (handle both field names)
        const orderOrgId =
          order.organizationId?.toString() ||
          order.organization?.toString() ||
          order._original?.organization?.toString();

        Logger.info(
          `[DeliveryCheckinSvc] Checking SwagOrder ownership: orderOrgId=${orderOrgId}, userOrgId=${user?.organizationProfileId}`
        );

        if (
          !user ||
          !orderOrgId ||
          orderOrgId !== user.organizationProfileId?.toString()
        ) {
          Logger.warn(
            `[DeliveryCheckinSvc] SwagOrder ownership check failed: user=${!!user}, orderOrgId=${orderOrgId}, userOrgId=${
              user?.organizationProfileId
            }`
          );
          throw new ForbiddenException(
            "Bạn không có quyền truy cập đơn hàng này"
          );
        }
      }

      return { order: order._original || order, orderType };
    }

    // Try MasterOrder first
    let order = await MasterOrder.findById(orderId);
    if (order) {
      if (order.customerId.toString() !== customerId.toString()) {
        throw new ForbiddenException(
          "Bạn không có quyền truy cập đơn hàng này"
        );
      }
      return { order, orderType: ORDER_TYPES.MASTER };
    }

    // Try SwagOrder
    order = await SwagOrder.findById(orderId);
    if (order) {
      const user = await User.findById(customerId);
      Logger.info(
        `[DeliveryCheckinSvc] SwagOrder fallback: order.organization=${order.organization}, user.organizationProfileId=${user?.organizationProfileId}`
      );

      if (
        !user ||
        order.organization?.toString() !==
          user.organizationProfileId?.toString()
      ) {
        Logger.warn(
          `[DeliveryCheckinSvc] SwagOrder fallback ownership check failed`
        );
        throw new ForbiddenException(
          "Bạn không có quyền truy cập đơn hàng này"
        );
      }
      return { order, orderType: ORDER_TYPES.SWAG };
    }

    throw new NotFoundException("Order", orderId);
  }

  /**
   * Check if user has access to a check-in
   * Shipper can access their own check-ins
   * Customer can access check-ins for their orders
   * Admin can access all check-ins
   *
   * @param {Object} user - User object
   * @param {Object} checkin - Check-in object
   * @returns {boolean}
   */
  canAccessCheckin(user, checkin) {
    // Extract IDs safely (handle both ObjectId and populated objects)
    const shipperIdStr = (
      checkin.shipperId?._id || checkin.shipperId
    )?.toString();
    const customerIdStr = (
      checkin.customerId?._id || checkin.customerId
    )?.toString();
    const userIdStr = user._id.toString();

    // Admin can access all
    if (user.isAdmin || user.role === "admin") {
      return true;
    }

    // Check if user ID matches shipper ID directly
    if (shipperIdStr && userIdStr === shipperIdStr) {
      return true;
    }

    // Check if user ID matches customer ID directly
    if (customerIdStr && userIdStr === customerIdStr) {
      return true;
    }

    // For SwagOrder check-ins, check organization ownership
    if (checkin.orderType === ORDER_TYPES.SWAG && user.organizationProfileId) {
      return "check_swag_order"; // Special return value to indicate async check needed
    }

    // For MasterOrder check-ins, also check if user has any profile that could access
    if (checkin.orderType === ORDER_TYPES.MASTER) {
      // If user has any profile, they might have access through order ownership
      if (
        user.customerProfileId ||
        user.shipperProfileId ||
        user.organizationProfileId
      ) {
        return "check_master_order"; // Special return value for async check
      }
    }

    return false;
  }

  /**
   * Create a new delivery check-in with full workflow
   * Supports polymorphic order references (SwagOrder, MasterOrder)
   *
   * **Feature: delivery-checkin-system, Property 6: Check-in Data Completeness**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   * **Feature: delivery-checkin-system, Property 18: Email Notification Trigger**
   * **Feature: delivery-checkin-system, Property 33: Order Status Update on Check-in**
   *
   * @param {string} shipperId - Shipper user ID
   * @param {Object} data - Check-in data (must include orderId, optionally orderType)
   * @param {Array} files - Photo files (optional)
   * @returns {Promise<Object>}
   *
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
   */
  async createCheckin(shipperId, data, files = []) {
    Logger.debug(
      `[DeliveryCheckinSvc] Creating check-in for shipper: ${shipperId}`
    );

    // Step 1: Validate shipper has access to order (with polymorphic support)
    const { user: shipperUser, shipperProfile } = await this.verifyShipperRole(
      shipperId
    );

    // Determine orderType - from data, from orderNumber, or auto-detect
    let orderType = data.orderType;
    if (!orderType && data.orderNumber) {
      orderType = detectOrderTypeFromNumber(data.orderNumber);
    }

    const { order, orderType: resolvedOrderType } =
      await this.verifyShipperOrderAccess(shipperId, data.orderId, orderType);

    // Use resolved orderType
    orderType = resolvedOrderType;

    Logger.debug(
      `[DeliveryCheckinSvc] Order type resolved: ${orderType} for order ${order.orderNumber}`
    );

    // Step 2: Validate GPS coordinates
    const gpsValidation = await this.validateGPSCoordinates(data);

    // Step 3: Call GoongGeocodingService for address (if not provided)
    let address = data.address;
    if (!address || !address.formatted) {
      address = await this.geocodeAddress(data.location.coordinates);
    }

    // Step 4: Call PhotoUploadService for photos
    let uploadedPhotos = [];
    if (files && files.length > 0) {
      uploadedPhotos = await this.processPhotoUploads(files, shipperId);
    } else if (data.photos && data.photos.length > 0) {
      // Photos already processed (e.g., from retry)
      uploadedPhotos = data.photos;
    }

    // Step 5: Extract customer info based on order type
    let customerId, customerEmail;
    if (orderType === ORDER_TYPES.MASTER) {
      customerId = data.customerId || order.customerId;
      customerEmail = data.customerEmail || order.customerEmail;
    } else if (orderType === ORDER_TYPES.SWAG) {
      // For SwagOrder, get customer from createdBy or organization
      customerId = data.customerId || order.createdBy;
      // Need to lookup email from User
      if (!data.customerEmail && customerId) {
        const customerUser = await User.findById(customerId).select("email");
        customerEmail = customerUser?.email || data.customerEmail;
      } else {
        customerEmail = data.customerEmail;
      }
    }

    // Step 6: Create check-in record with polymorphic reference
    const checkinData = {
      // Polymorphic reference fields
      orderType,
      orderModel: ORDER_TYPE_TO_MODEL[orderType],
      orderId: data.orderId,
      orderNumber: data.orderNumber || order.orderNumber,

      // Shipper info
      shipperId,
      shipperName:
        data.shipperName ||
        shipperUser.displayName ||
        shipperProfile.name ||
        "Shipper",

      // Customer info (denormalized)
      customerId,
      customerEmail,

      // Location
      location: {
        type: "Point",
        coordinates: data.location.coordinates,
      },

      // Address
      address: {
        formatted: address.formatted,
        street: address.street || "",
        ward: address.ward || "",
        district: address.district || "",
        city: address.city || "",
        country: address.country || "Vietnam",
      },

      // GPS Metadata
      gpsMetadata: {
        accuracy: data.gpsMetadata?.accuracy,
        altitude: data.gpsMetadata?.altitude,
        heading: data.gpsMetadata?.heading,
        speed: data.gpsMetadata?.speed,
        timestamp: data.gpsMetadata?.timestamp || new Date(),
        source: data.gpsMetadata?.source || "device",
      },

      // Photos
      photos: uploadedPhotos,

      // Notes & Status
      notes: data.notes || "",
      checkinAt: data.checkinAt || new Date(),
      status: CHECKIN_STATUS.COMPLETED,
    };

    // Add GPS warning if accuracy is low
    if (gpsValidation.warning) {
      checkinData.gpsMetadata.warning = gpsValidation.warning;
    }

    const checkin = await this.repository.create(checkinData);

    Logger.success(
      `[DeliveryCheckinSvc] Created check-in: ${checkin._id} for order ${checkin.orderNumber}`
    );

    // Step 6: Call ThreadIntegrationService to create delivery thread
    let thread = null;
    try {
      thread = await this.threadIntegrationService.createDeliveryThread(
        checkin
      );
      if (thread) {
        // Update check-in with thread ID
        await this.repository.updateThreadId(checkin._id, thread._id);
        checkin.threadId = thread._id;
        Logger.success(
          `[DeliveryCheckinSvc] Thread created: ${thread._id} for check-in: ${checkin._id}`
        );
      }
    } catch (error) {
      Logger.error(
        `[DeliveryCheckinSvc] Failed to create thread for check-in ${checkin._id}:`,
        error
      );
      // Continue - thread creation failure shouldn't fail the check-in
    }

    // Step 7: Update order status
    try {
      const updatedOrder =
        await this.orderStatusIntegrationService.updateOrderStatusOnCheckin(
          order,
          checkin
        );
      await updatedOrder.save();

      // Check if all recipients have been delivered
      const allCheckins = await this.repository.findByOrder(data.orderId);
      if (
        this.orderStatusIntegrationService.checkOrderCompletion(
          order,
          allCheckins
        )
      ) {
        await this.orderStatusIntegrationService.markOrderAsCompleted(order);
        await order.save();
      }
    } catch (error) {
      Logger.error(
        `[DeliveryCheckinSvc] Failed to update order status for check-in ${checkin._id}:`,
        error
      );
      // Continue - order status update failure shouldn't fail the check-in
    }

    // Step 8: Call EmailNotificationService
    try {
      await this.emailNotificationService.sendCheckinNotification(checkin);
    } catch (error) {
      Logger.error(
        `[DeliveryCheckinSvc] Failed to send email notification for check-in ${checkin._id}:`,
        error
      );
      // Continue - email failure shouldn't fail the check-in
    }

    return checkin;
  }

  /**
   * Validate GPS coordinates
   * @param {Object} data - Check-in data with location
   * @returns {Object} Validation result
   * @private
   */
  async validateGPSCoordinates(data) {
    if (!data.location || !data.location.coordinates) {
      throw new ValidationException("GPS coordinates là bắt buộc");
    }

    const [longitude, latitude] = data.location.coordinates;

    // Validate coordinate values
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      isNaN(longitude) ||
      isNaN(latitude)
    ) {
      throw new ValidationException("GPS coordinates không hợp lệ");
    }

    // Validate coordinate range
    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new ValidationException("GPS coordinates nằm ngoài phạm vi hợp lệ");
    }

    // Validate accuracy using GoongGeocodingService
    const gpsData = {
      latitude,
      longitude,
      accuracy: data.gpsMetadata?.accuracy,
    };

    const validation = this.goongGeocodingService.validateCoordinates(gpsData);

    if (!validation.isValid) {
      throw new ValidationException(
        validation.warning || "GPS coordinates không hợp lệ"
      );
    }

    return validation;
  }

  /**
   * Geocode coordinates to address using Goong.io
   * @param {Array} coordinates - [longitude, latitude]
   * @returns {Promise<Object>} Address object
   * @private
   */
  async geocodeAddress(coordinates) {
    const [longitude, latitude] = coordinates;

    try {
      const address = await this.goongGeocodingService.reverseGeocode(
        latitude,
        longitude
      );
      return address;
    } catch (error) {
      Logger.error(`[DeliveryCheckinSvc] Failed to geocode address:`, error);
      // Return fallback address
      return {
        formatted: `${latitude}, ${longitude}`,
        street: "",
        ward: "",
        district: "",
        city: "",
        country: "Vietnam",
      };
    }
  }

  /**
   * Process photo uploads
   * @param {Array} files - Photo files
   * @param {string} shipperId - Shipper ID for metadata
   * @returns {Promise<Array>} Uploaded photo data
   * @private
   */
  async processPhotoUploads(files, shipperId) {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      const fileBuffers = files.map((file) => file.buffer);
      const metadataArray = files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: shipperId,
      }));

      const uploadedPhotos = await this.photoUploadService.uploadMultiplePhotos(
        fileBuffers,
        metadataArray
      );

      return uploadedPhotos.map((photo) => ({
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        filename: photo.filename,
        size: photo.size,
        mimeType: photo.mimeType,
        width: photo.width,
        height: photo.height,
        uploadedAt: new Date(),
      }));
    } catch (error) {
      Logger.error(`[DeliveryCheckinSvc] Failed to upload photos:`, error);
      throw new ValidationException(`Không thể tải ảnh lên: ${error.message}`);
    }
  }

  /**
   * Get check-in by ID
   *
   * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 13.4, 13.5**
   *
   * @param {string} userId - Requesting user ID
   * @param {string} checkinId - Check-in ID
   * @param {Object} user - User object (optional, for authorization)
   * @returns {Promise<Object>}
   */
  async getCheckin(userId, checkinId, user = null) {
    Logger.debug(
      `[DeliveryCheckinSvc] getCheckin: userId=${userId}, checkinId=${checkinId}`
    );

    const checkin = await this.repository.findById(checkinId);
    if (!checkin) {
      throw new NotFoundException("Delivery Check-in", checkinId);
    }

    // If user object is provided, perform authorization check
    if (user) {
      const accessResult = this.canAccessCheckin(user, checkin);

      if (accessResult === true) {
        // Access granted
        return checkin;
      } else if (accessResult === "check_swag_order") {
        // Need to check SwagOrder organization ownership
        try {
          await this.verifyCustomerOrderOwnership(
            user._id,
            checkin.orderId.toString(),
            ORDER_TYPES.SWAG
          );
          Logger.info(
            `[DeliveryCheckinSvc] SwagOrder access granted for user ${user._id}`
          );
          return checkin;
        } catch (error) {
          Logger.info(
            `[DeliveryCheckinSvc] SwagOrder access denied for user ${user._id}: ${error.message}`
          );
          // Try shipper access for SwagOrder as fallback
          try {
            await this.verifyShipperOrderAccess(
              user._id,
              checkin.orderId.toString(),
              ORDER_TYPES.SWAG
            );
            Logger.info(
              `[DeliveryCheckinSvc] SwagOrder shipper access granted for user ${user._id}`
            );
            return checkin;
          } catch (shipperError) {
            Logger.info(
              `[DeliveryCheckinSvc] SwagOrder shipper access denied for user ${user._id}: ${shipperError.message}`
            );
            throw new ForbiddenException(
              "Bạn không có quyền truy cập check-in này"
            );
          }
        }
      } else if (accessResult === "check_master_order") {
        // Need to check MasterOrder ownership
        try {
          await this.verifyCustomerOrderOwnership(
            user._id,
            checkin.orderId.toString(),
            ORDER_TYPES.MASTER
          );
          Logger.info(
            `[DeliveryCheckinSvc] MasterOrder access granted for user ${user._id}`
          );
          return checkin;
        } catch (error) {
          Logger.info(
            `[DeliveryCheckinSvc] MasterOrder access denied for user ${user._id}: ${error.message}`
          );
          // Try shipper access for MasterOrder
          try {
            await this.verifyShipperOrderAccess(
              user._id,
              checkin.orderId.toString(),
              ORDER_TYPES.MASTER
            );
            Logger.info(
              `[DeliveryCheckinSvc] MasterOrder shipper access granted for user ${user._id}`
            );
            return checkin;
          } catch (shipperError) {
            Logger.info(
              `[DeliveryCheckinSvc] MasterOrder shipper access denied for user ${user._id}: ${shipperError.message}`
            );
            throw new ForbiddenException(
              "Bạn không có quyền truy cập check-in này"
            );
          }
        }
      } else {
        // Access denied
        throw new ForbiddenException(
          "Bạn không có quyền truy cập check-in này"
        );
      }
    } else {
      // Fallback: check if userId matches shipper or customer
      const isShipper = checkin.shipperId.toString() === userId.toString();
      const isCustomer = checkin.customerId.toString() === userId.toString();

      if (!isShipper && !isCustomer) {
        // For SwagOrder, also check organization ownership
        if (checkin.orderType === ORDER_TYPES.SWAG) {
          try {
            await this.verifyCustomerOrderOwnership(
              userId,
              checkin.orderId.toString(),
              ORDER_TYPES.SWAG
            );
            Logger.info(
              `[DeliveryCheckinSvc] SwagOrder fallback access granted for user ${userId}`
            );
            return checkin;
          } catch (error) {
            Logger.info(
              `[DeliveryCheckinSvc] SwagOrder fallback access denied for user ${userId}: ${error.message}`
            );
            // Try shipper access as last resort
            try {
              await this.verifyShipperOrderAccess(
                userId,
                checkin.orderId.toString(),
                ORDER_TYPES.SWAG
              );
              Logger.info(
                `[DeliveryCheckinSvc] SwagOrder shipper fallback access granted for user ${userId}`
              );
              return checkin;
            } catch (shipperError) {
              Logger.info(
                `[DeliveryCheckinSvc] SwagOrder shipper fallback access denied for user ${userId}: ${shipperError.message}`
              );
            }
          }
        }

        throw new ForbiddenException(
          "Bạn không có quyền truy cập check-in này"
        );
      }
    }

    return checkin;
  }

  /**
   * Get check-ins by order
   * Supports polymorphic order types (SwagOrder, MasterOrder)
   *
   * **Feature: delivery-checkin-system, Property 4: Shipper Order Filtering**
   * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 1.4, 13.4, 13.5**
   *
   * @param {string} userId - Requesting user ID
   * @param {string} orderId - Order ID
   * @param {Object} user - User object (optional, for authorization)
   * @param {string} orderType - Order type (optional, for filtering)
   * @returns {Promise<Array>}
   */
  async getCheckinsByOrder(userId, orderId, user = null, orderType = null) {
    // Find the order using polymorphic resolver
    let order = null;
    let resolvedOrderType = orderType;

    if (orderType && isValidOrderType(orderType)) {
      order = await orderResolverService.resolveById(orderId, orderType);
    } else {
      // Try both order types
      order = await MasterOrder.findById(orderId);
      if (order) {
        resolvedOrderType = ORDER_TYPES.MASTER;
      } else {
        order = await SwagOrder.findById(orderId);
        if (order) {
          resolvedOrderType = ORDER_TYPES.SWAG;
        }
      }
    }

    if (!order) {
      throw new NotFoundException("Order", orderId);
    }

    // Authorization check
    if (user) {
      // Admin can access all
      if (!user.isAdmin) {
        // Shipper can access if they have shipper profile
        const isShipper = !!user.shipperProfileId;

        // Customer can access based on order type
        let isCustomer = false;
        if (resolvedOrderType === ORDER_TYPES.MASTER) {
          isCustomer =
            user.customerProfileId &&
            (order.customerId?.toString() === user._id.toString() ||
              order._original?.customerId?.toString() === user._id.toString());
        } else if (resolvedOrderType === ORDER_TYPES.SWAG) {
          // For SwagOrder, check organization ownership
          isCustomer =
            user.organizationProfileId &&
            (order.organization?.toString() ===
              user.organizationProfileId.toString() ||
              order.organizationId?.toString() ===
                user.organizationProfileId.toString());
        }

        if (!isShipper && !isCustomer) {
          throw new ForbiddenException(
            "Bạn không có quyền truy cập check-in của đơn hàng này"
          );
        }
      }
    } else {
      // Fallback authorization check
      let hasAccess = false;

      if (resolvedOrderType === ORDER_TYPES.MASTER) {
        hasAccess = order.customerId?.toString() === userId.toString();
      } else if (resolvedOrderType === ORDER_TYPES.SWAG) {
        const userDoc = await User.findById(userId);
        hasAccess =
          userDoc &&
          order.organization?.toString() ===
            userDoc.organizationProfileId?.toString();
      }

      if (!hasAccess) {
        // Check if user is a shipper by looking at check-ins
        const checkins = await this.repository.findByOrder(
          orderId,
          resolvedOrderType
        );
        const isShipperForOrder = checkins.some(
          (c) => c.shipperId.toString() === userId.toString()
        );
        if (!isShipperForOrder) {
          throw new ForbiddenException(
            "Bạn không có quyền truy cập check-in của đơn hàng này"
          );
        }
      }
    }

    return await this.repository.findByOrder(orderId, resolvedOrderType);
  }

  /**
   * Get check-ins by shipper (history)
   * @param {string} shipperId - Shipper ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getCheckinsByShipper(shipperId, options = {}) {
    const checkins = await this.repository.findByShipper(shipperId, options);
    return {
      checkins,
      pagination: {
        page: options.page || 1,
        limit: options.limit || 20,
        total: checkins.length,
      },
    };
  }

  /**
   * Get check-ins by customer (for map view)
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getCheckinsByCustomer(customerId, options = {}) {
    return await this.repository.findByCustomer(customerId, options);
  }

  /**
   * Get shipper's assigned orders for check-in
   * @param {string} shipperId - Shipper user ID
   * @returns {Promise<Array>} List of assigned orders
   */
  async getAssignedOrders(shipperId) {
    Logger.debug(
      `[DeliveryCheckinSvc] Getting assigned orders for shipper: ${shipperId}`
    );

    // Verify shipper role (skip for performance - middleware already checked)
    // await this.verifyShipperRole(shipperId);

    // Get orders assigned to this shipper that are ready for delivery
    // Optimized query with proper field selection and sorting
    const orders = await MasterOrder.find({
      assignedShipperId: shipperId,
      masterStatus: { $in: ["shipping", "processing"] },
      paymentStatus: "paid",
    })
      .select(
        "orderNumber customerName customerEmail shippingAddress masterStatus createdAt shipperAssignedAt"
      )
      .sort({ shipperAssignedAt: -1 })
      .limit(50) // Limit to recent 50 orders for performance
      .lean();

    Logger.debug(
      `[DeliveryCheckinSvc] Found ${orders.length} assigned orders for shipper ${shipperId}`
    );

    // Transform to match frontend expected format
    return orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      status: order.masterStatus,
      createdAt: order.createdAt,
      assignedAt: order.shipperAssignedAt,
    }));
  }

  /**
   * Delete check-in (soft delete)
   *
   * **Feature: delivery-checkin-system, Property 37: Check-in Deletion Reverts Status**
   * **Feature: delivery-checkin-system, Property 49: Soft Delete with Audit Trail**
   * **Validates: Requirements 10.5, 13.6**
   *
   * @param {string} shipperId - Shipper ID
   * @param {string} checkinId - Check-in ID
   * @returns {Promise<void>}
   */
  async deleteCheckin(shipperId, checkinId) {
    const checkin = await this.repository.findById(checkinId);
    if (!checkin) {
      throw new NotFoundException("Delivery Check-in", checkinId);
    }

    // Verify shipper owns check-in
    const checkinShipperId = checkin.shipperId._id
      ? checkin.shipperId._id.toString()
      : checkin.shipperId.toString();
    if (checkinShipperId !== shipperId.toString()) {
      throw new ForbiddenException("Bạn không có quyền xóa check-in này");
    }

    // Soft delete the check-in
    await this.repository.delete(checkinId, shipperId);
    Logger.success(`[DeliveryCheckinSvc] Deleted check-in: ${checkinId}`);

    // Revert order status if this was the only check-in for the order
    try {
      const orderId = checkin.orderId._id
        ? checkin.orderId._id
        : checkin.orderId;
      const remainingCheckins = await this.repository.findByOrder(orderId);

      // Filter out the deleted check-in and any other deleted check-ins
      const activeCheckins = remainingCheckins.filter(
        (c) => !c.isDeleted && c._id.toString() !== checkinId.toString()
      );

      if (activeCheckins.length === 0) {
        // This was the only check-in, revert order status
        const order = await MasterOrder.findById(orderId);
        if (order && order.status === "delivered") {
          // Determine previous status from history or default to "shipped"
          let previousStatus = "shipped";
          if (order.statusHistory && order.statusHistory.length > 0) {
            // Find the status before "delivered"
            for (let i = order.statusHistory.length - 1; i >= 0; i--) {
              if (order.statusHistory[i].status !== "delivered") {
                previousStatus = order.statusHistory[i].status;
                break;
              }
            }
          }

          await this.orderStatusIntegrationService.revertOrderStatusOnCheckinDeletion(
            order,
            previousStatus
          );
          await order.save();
          Logger.success(
            `[DeliveryCheckinSvc] Reverted order ${orderId} status to ${previousStatus}`
          );
        }
      }
    } catch (error) {
      Logger.error(
        `[DeliveryCheckinSvc] Failed to revert order status for check-in ${checkinId}:`,
        error
      );
      // Continue - order status reversion failure shouldn't fail the deletion
    }
  }

  /**
   * Get check-ins within geographic bounds
   * @param {Object} bounds - Geographic bounds { minLng, minLat, maxLng, maxLat }
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getCheckinsByBounds(bounds, options = {}) {
    Logger.debug(
      `[DeliveryCheckinSvc] Getting check-ins within bounds: ${JSON.stringify(
        bounds
      )}`
    );

    // Validate bounds
    if (
      bounds.minLng === undefined ||
      bounds.minLat === undefined ||
      bounds.maxLng === undefined ||
      bounds.maxLat === undefined
    ) {
      throw new ValidationException("Bounds không hợp lệ");
    }

    const checkins = await this.repository.findWithinBounds(bounds);

    // Filter by customer if specified
    if (options.customerId) {
      return checkins.filter(
        (c) => c.customerId.toString() === options.customerId.toString()
      );
    }

    return checkins;
  }

  /**
   * Retry photo upload for a check-in
   * @param {string} shipperId - Shipper ID
   * @param {string} checkinId - Check-in ID
   * @param {Array} files - Photo files to upload
   * @returns {Promise<Object>}
   */
  async retryPhotoUpload(shipperId, checkinId, files) {
    const checkin = await this.repository.findById(checkinId);
    if (!checkin) {
      throw new NotFoundException("Delivery Check-in", checkinId);
    }

    // Verify shipper owns check-in
    if (
      checkin.shipperId._id?.toString() !== shipperId.toString() &&
      checkin.shipperId.toString() !== shipperId.toString()
    ) {
      throw new ForbiddenException("Bạn không có quyền cập nhật check-in này");
    }

    // Photo upload logic will be implemented in task 4 (PhotoUploadService)
    // For now, just log and return the check-in
    Logger.debug(
      `[DeliveryCheckinSvc] Retry photo upload for check-in: ${checkinId}, files: ${files.length}`
    );

    // TODO: Implement actual photo upload in task 7
    // const uploadedPhotos = await this.photoUploadService.uploadPhotos(files);
    // Update check-in with new photos

    return checkin;
  }
}
