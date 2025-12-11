// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.controller.js

import { DeliveryCheckinService } from "./delivery-checkin.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import logger from "../../infrastructure/logger.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

export class DeliveryCheckinController {
  constructor() {
    this.service = new DeliveryCheckinService();
  }

  /**
   * Create a new delivery check-in with photo upload
   * @route POST /api/delivery-checkins
   * @access Shipper only
   */
  createCheckin = async (req, res, next) => {
    try {
      const shipperId = req.user._id;

      Logger.debug(
        `[DeliveryCheckinCtrl] Creating check-in for shipper: ${shipperId}`
      );

      // Extract files from multer
      const files = req.files || [];

      // Parse JSON fields from form-data if needed
      let checkinData = { ...req.body };

      // Parse location if it's a string (from form-data)
      if (typeof checkinData.location === "string") {
        try {
          checkinData.location = JSON.parse(checkinData.location);
        } catch (e) {
          throw new ValidationException("Định dạng location không hợp lệ");
        }
      }

      // Parse gpsMetadata if it's a string
      if (typeof checkinData.gpsMetadata === "string") {
        try {
          checkinData.gpsMetadata = JSON.parse(checkinData.gpsMetadata);
        } catch (e) {
          throw new ValidationException("Định dạng gpsMetadata không hợp lệ");
        }
      }

      // Parse address if it's a string
      if (typeof checkinData.address === "string") {
        try {
          checkinData.address = JSON.parse(checkinData.address);
        } catch (e) {
          throw new ValidationException("Định dạng address không hợp lệ");
        }
      }

      // Add files to data
      checkinData.files = files;

      const checkin = await this.service.createCheckin(shipperId, checkinData);

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ checkin }, "Đã tạo check-in giao hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all check-ins with optional filtering
   * @route GET /api/delivery-checkins
   * @access Authenticated users
   */
  getCheckins = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { status, page, limit, startDate, endDate } = req.query;

      const options = {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      // Determine user role and fetch appropriate check-ins
      const userRole = req.user.getRole();
      const isShipperUser = userRole === "shipper" || req.user.shipperProfileId;

      let result;
      if (isShipperUser) {
        result = await this.service.getCheckinsByShipper(userId, options);
      } else {
        result = await this.service.getCheckinsByCustomer(userId, options);
      }

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get check-in by ID
   * @route GET /api/delivery-checkins/:id
   * @access Authenticated users (shipper, customer, or admin)
   *
   * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 13.4, 13.5**
   */
  getCheckin = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Pass user object for proper authorization
      const checkin = await this.service.getCheckin(userId, id, req.user);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ checkin }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete check-in (soft delete)
   * @route DELETE /api/delivery-checkins/:id
   * @access Shipper only (owner of check-in)
   */
  deleteCheckin = async (req, res, next) => {
    try {
      const shipperId = req.user._id;
      const { id } = req.params;

      await this.service.deleteCheckin(shipperId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa check-in"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get check-ins by order
   * @route GET /api/delivery-checkins/order/:orderId
   * @access Authenticated users (shipper assigned to order or customer who owns order)
   *
   * **Feature: delivery-checkin-system, Property 4: Shipper Order Filtering**
   * **Feature: delivery-checkin-system, Property 47: Shipper Order Assignment Verification**
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 1.4, 13.4, 13.5**
   */
  getCheckinsByOrder = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { orderId } = req.params;

      // Pass user object for proper authorization
      const checkins = await this.service.getCheckinsByOrder(
        userId,
        orderId,
        req.user
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ checkins }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current shipper's check-in history (uses token)
   * @route GET /api/delivery-checkins/shipper
   * @access Shipper only
   */
  getMyShipperHistory = async (req, res, next) => {
    try {
      const shipperId = req.user._id;
      const { page, limit, startDate, endDate, status } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      };

      const result = await this.service.getCheckinsByShipper(
        shipperId,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get shipper's assigned orders for check-in
   * @route GET /api/delivery-checkins/assigned-orders
   * @access Shipper only
   */
  getAssignedOrders = async (req, res, next) => {
    try {
      const shipperId = req.user._id;

      const orders = await this.service.getAssignedOrders(shipperId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ orders }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get shipper's check-in history
   * @route GET /api/delivery-checkins/shipper/:shipperId
   * @access Shipper only (own data) or Admin
   */
  getShipperHistory = async (req, res, next) => {
    try {
      const { shipperId } = req.params;
      const { page, limit, startDate, endDate, status } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      };

      const result = await this.service.getCheckinsByShipper(
        shipperId,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current customer's check-ins (for map view) - uses token
   * @route GET /api/delivery-checkins/customer
   * @access Customer only
   */
  getMyCustomerCheckins = async (req, res, next) => {
    try {
      const customerId = req.user._id;
      const { startDate, endDate, limit } = req.query;

      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: parseInt(limit) || 100,
      };

      const checkins = await this.service.getCheckinsByCustomer(
        customerId,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ checkins }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer's check-ins (for map view)
   * @route GET /api/delivery-checkins/customer/:customerId
   * @access Customer only (own data) or Admin
   */
  getCustomerCheckins = async (req, res, next) => {
    try {
      const { customerId } = req.params;
      const { startDate, endDate, limit } = req.query;

      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: parseInt(limit) || 100,
      };

      const checkins = await this.service.getCheckinsByCustomer(
        customerId,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ checkins }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get check-ins within geographic bounds (for map view)
   * @route GET /api/delivery-checkins/map/bounds
   * @access Authenticated users
   * @query minLng, minLat, maxLng, maxLat - Geographic bounds
   * @query customerId - Optional filter by customer
   */
  getCheckinsByBounds = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { minLng, minLat, maxLng, maxLat, customerId } = req.query;

      // Validate bounds parameters
      if (!minLng || !minLat || !maxLng || !maxLat) {
        throw new ValidationException(
          "Vui lòng cung cấp đầy đủ tọa độ bounds (minLng, minLat, maxLng, maxLat)"
        );
      }

      const bounds = {
        minLng: parseFloat(minLng),
        minLat: parseFloat(minLat),
        maxLng: parseFloat(maxLng),
        maxLat: parseFloat(maxLat),
      };

      // Validate bounds values
      if (
        isNaN(bounds.minLng) ||
        isNaN(bounds.minLat) ||
        isNaN(bounds.maxLng) ||
        isNaN(bounds.maxLat)
      ) {
        throw new ValidationException("Tọa độ bounds không hợp lệ");
      }

      // Validate longitude range (-180 to 180)
      if (
        bounds.minLng < -180 ||
        bounds.minLng > 180 ||
        bounds.maxLng < -180 ||
        bounds.maxLng > 180
      ) {
        throw new ValidationException(
          "Kinh độ phải nằm trong khoảng -180 đến 180"
        );
      }

      // Validate latitude range (-90 to 90)
      if (
        bounds.minLat < -90 ||
        bounds.minLat > 90 ||
        bounds.maxLat < -90 ||
        bounds.maxLat > 90
      ) {
        throw new ValidationException("Vĩ độ phải nằm trong khoảng -90 đến 90");
      }

      const options = {
        customerId: customerId || userId,
      };

      const checkins = await this.service.getCheckinsByBounds(bounds, options);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ checkins }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retry photo upload for a specific photo in a check-in
   * @route POST /api/delivery-checkins/:id/photos/retry
   * @access Shipper only (owner of check-in)
   */
  retryPhotoUpload = async (req, res, next) => {
    try {
      const shipperId = req.user._id;
      const { id } = req.params;
      const files = req.files || [];

      if (files.length === 0) {
        throw new ValidationException("Vui lòng chọn ảnh để upload");
      }

      const checkin = await this.service.retryPhotoUpload(shipperId, id, files);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ checkin }, "Đã upload ảnh thành công"));
    } catch (error) {
      next(error);
    }
  };
}
