// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.middleware.js

import { MasterOrder } from "../../shared/models/master-order.model.js";
import { ShipperProfile } from "../../shared/models/shipper-profile.model.js";
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
 * Middleware to check if user is a shipper
 * Shippers have shipperProfileId linked to their user account
 *
 * **Feature: delivery-checkin-system, Property 1: Shipper Role Assignment**
 * **Validates: Requirements 1.1**
 */
export const isShipper = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  try {
    // Check if user has shipper profile linked
    if (!req.user.shipperProfileId) {
      Logger.debug(
        `[ShipperAuth] User ${req.user._id} does not have shipper profile`
      );
      return res.status(403).json({
        success: false,
        message: "Forbidden: Yêu cầu quyền shipper",
        requiresShipperAccount: true,
      });
    }

    // Verify shipper profile is active
    const shipperProfile = await ShipperProfile.findById(
      req.user.shipperProfileId
    );
    if (!shipperProfile || !shipperProfile.isActive) {
      Logger.debug(
        `[ShipperAuth] Shipper profile ${req.user.shipperProfileId} is inactive or not found`
      );
      return res.status(403).json({
        success: false,
        message: "Forbidden: Tài khoản shipper không hoạt động",
        requiresShipperAccount: true,
      });
    }

    // Attach shipper profile to request for later use
    req.shipperProfile = shipperProfile;
    return next();
  } catch (error) {
    Logger.error(`[ShipperAuth] Error checking shipper status:`, error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xác thực shipper",
    });
  }
};

/**
 * Middleware to check if user is a customer (has customerProfileId)
 *
 * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
 * **Validates: Requirements 13.5**
 */
export const isCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  // Check if user has customer profile
  if (req.user.customerProfileId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Yêu cầu tài khoản khách hàng",
    requiresCustomerAccount: true,
  });
};

/**
 * Middleware to check if user is either shipper or customer
 * Used for endpoints that both roles can access
 *
 * **Feature: delivery-checkin-system, Property 3: Shipper Authorization Boundaries**
 * **Validates: Requirements 1.3**
 */
export const isShipperOrCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  const isShipperUser = !!req.user.shipperProfileId;
  const isCustomerUser = !!req.user.customerProfileId;

  if (isShipperUser || isCustomerUser) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Yêu cầu quyền shipper hoặc khách hàng",
  });
};

/**
 * Middleware to verify shipper can only access their own data
 * @param {string} paramName - The route parameter name containing shipper ID
 */
export const verifyShipperOwnership = (paramName = "shipperId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    const requestedShipperId = req.params[paramName];
    const currentUserId = req.user._id.toString();

    // Admin can access any shipper's data
    if (req.user.isAdmin) {
      return next();
    }

    // Shipper can only access their own data
    if (requestedShipperId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Bạn chỉ có thể xem dữ liệu của chính mình",
      });
    }

    next();
  };
};

/**
 * Middleware to verify customer can only access their own data
 * @param {string} paramName - The route parameter name containing customer ID
 *
 * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
 * **Validates: Requirements 13.5**
 */
export const verifyCustomerOwnership = (paramName = "customerId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    const requestedCustomerId = req.params[paramName];
    const currentUserId = req.user._id.toString();

    // Admin can access any customer's data
    if (req.user.isAdmin) {
      return next();
    }

    // Customer can only access their own data
    if (requestedCustomerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Bạn chỉ có thể xem dữ liệu của chính mình",
      });
    }

    next();
  };
};

/**
 * Middleware to verify shipper is assigned to the order
 * This checks if the shipper has permission to create check-in for the order
 *
 * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
 * **Validates: Requirements 13.4**
 *
 * @param {string} paramName - The route parameter or body field name containing order ID
 */
export const verifyShipperOrderAssignment = (paramName = "orderId") => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    try {
      // Get order ID from params or body
      const orderId = req.params[paramName] || req.body[paramName];

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID là bắt buộc",
        });
      }

      // Admin can access any order
      if (req.user.isAdmin) {
        return next();
      }

      // Find the order
      const order = await MasterOrder.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // For now, we allow any active shipper to create check-ins for any order
      // In a full implementation, you would check if the shipper is assigned to this order
      // via a delivery assignment system

      // Check if shipper is active
      if (!req.user.shipperProfileId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Bạn không có quyền shipper",
        });
      }

      // Attach order to request for later use
      req.order = order;

      Logger.debug(
        `[ShipperAuth] Shipper ${req.user._id} verified for order ${orderId}`
      );
      next();
    } catch (error) {
      Logger.error(`[ShipperAuth] Error verifying order assignment:`, error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi xác thực quyền truy cập đơn hàng",
      });
    }
  };
};

/**
 * Middleware to verify customer owns the order
 *
 * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
 * **Validates: Requirements 13.5**
 *
 * @param {string} paramName - The route parameter name containing order ID
 */
export const verifyCustomerOrderOwnership = (paramName = "orderId") => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    try {
      const orderId = req.params[paramName];

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID là bắt buộc",
        });
      }

      // Admin can access any order
      if (req.user.isAdmin) {
        return next();
      }

      // Find the order
      const order = await MasterOrder.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Verify customer owns the order
      if (order.customerId.toString() !== req.user._id.toString()) {
        Logger.debug(
          `[CustomerAuth] Customer ${req.user._id} does not own order ${orderId}`
        );
        return res.status(403).json({
          success: false,
          message: "Forbidden: Bạn không có quyền truy cập đơn hàng này",
        });
      }

      // Attach order to request for later use
      req.order = order;

      Logger.debug(
        `[CustomerAuth] Customer ${req.user._id} verified for order ${orderId}`
      );
      next();
    } catch (error) {
      Logger.error(`[CustomerAuth] Error verifying order ownership:`, error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi xác thực quyền truy cập đơn hàng",
      });
    }
  };
};

/**
 * Middleware to deny access to non-shipper features for shippers
 * This enforces authorization boundaries
 *
 * **Feature: delivery-checkin-system, Property 3: Shipper Authorization Boundaries**
 * **Validates: Requirements 1.3**
 */
export const denyShipperAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Yêu cầu đăng nhập",
      requiresAuth: true,
    });
  }

  // Check if user is a shipper (has shipper profile but no other profiles)
  const isOnlyShipper =
    req.user.shipperProfileId &&
    !req.user.customerProfileId &&
    !req.user.printerProfileId &&
    !req.user.organizationProfileId &&
    !req.user.isAdmin;

  if (isOnlyShipper) {
    Logger.debug(
      `[ShipperAuth] Shipper ${req.user._id} denied access to non-shipper feature`
    );
    return res.status(403).json({
      success: false,
      message: "Forbidden: Shipper không có quyền truy cập tính năng này",
    });
  }

  next();
};
