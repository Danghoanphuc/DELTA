// src/modules/swag-orders/swag-order.controller.js
// ✅ Swag Order Controller - HTTP handlers

import { SwagOrderService } from "./swag-order.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class SwagOrderController {
  constructor() {
    this.swagOrderService = new SwagOrderService();
  }

  /**
   * Create a new swag order
   * @route POST /api/swag-orders
   */
  createOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;

      const order = await this.swagOrderService.createOrder(
        organizationId,
        userId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ order }, "Đã tạo đơn gửi quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get orders list
   * @route GET /api/swag-orders
   */
  getOrders = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { status, page, limit, sortBy, sortOrder } = req.query;

      const result = await this.swagOrderService.getOrders(organizationId, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sortBy,
        sortOrder,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single order
   * @route GET /api/swag-orders/:id
   */
  getOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const order = await this.swagOrderService.getOrder(
        organizationId,
        req.params.id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ order }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order
   * @route PUT /api/swag-orders/:id
   */
  updateOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const order = await this.swagOrderService.updateOrder(
        organizationId,
        req.params.id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã cập nhật!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add recipients to order
   * @route POST /api/swag-orders/:id/recipients
   */
  addRecipients = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { recipientIds } = req.body;

      if (!recipientIds || !Array.isArray(recipientIds)) {
        throw new ValidationException("Vui lòng chọn người nhận");
      }

      const order = await this.swagOrderService.addRecipients(
        organizationId,
        req.params.id,
        recipientIds
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã thêm người nhận!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove recipient from order
   * @route DELETE /api/swag-orders/:id/recipients/:recipientId
   */
  removeRecipient = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const order = await this.swagOrderService.removeRecipient(
        organizationId,
        req.params.id,
        req.params.recipientId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã xóa người nhận!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Submit order for processing
   * @route POST /api/swag-orders/:id/submit
   */
  submitOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const order = await this.swagOrderService.submitOrder(
        organizationId,
        req.params.id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã gửi đơn hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process payment
   * @route POST /api/swag-orders/:id/pay
   */
  processPayment = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const order = await this.swagOrderService.processPayment(
        organizationId,
        req.params.id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Thanh toán thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update shipment status
   * @route PUT /api/swag-orders/:id/shipments/:recipientId/status
   */
  updateShipmentStatus = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { status, trackingNumber, trackingUrl, carrier } = req.body;

      const order = await this.swagOrderService.updateShipmentStatus(
        organizationId,
        req.params.id,
        req.params.recipientId,
        status,
        { trackingNumber, trackingUrl, carrier }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã cập nhật trạng thái!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel order
   * @route POST /api/swag-orders/:id/cancel
   */
  cancelOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { reason } = req.body;

      const order = await this.swagOrderService.cancelOrder(
        organizationId,
        req.params.id,
        reason
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ order }, "Đã hủy đơn hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get dashboard stats
   * @route GET /api/swag-orders/stats
   */
  getStats = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const stats = await this.swagOrderService.getStats(organizationId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend self-service email
   * @route POST /api/swag-orders/:id/resend-email/:recipientId
   */
  resendSelfServiceEmail = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const result = await this.swagOrderService.resendSelfServiceEmail(
        organizationId,
        req.params.id,
        req.params.recipientId
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // PUBLIC ROUTES (Self-Service Portal)
  // ============================================

  /**
   * Get order info by self-service token
   * @route GET /api/swag-orders/self-service/:token
   */
  getSelfServiceInfo = async (req, res, next) => {
    try {
      const { order, shipment } =
        await this.swagOrderService.getOrderBySelfServiceToken(
          req.params.token
        );

      // Return limited info for security
      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          orderName: order.name,
          packName: order.packSnapshot?.name,
          items: order.packSnapshot?.items?.map((item) => ({
            productName: item.productName,
            productImage: item.productImage,
            hasSize: item.hasSize,
            personalized: item.personalized,
          })),
          recipientInfo: shipment.recipientInfo,
          shippingAddress: shipment.shippingAddress,
          sizeSelections: shipment.sizeSelections,
          personalization: shipment.personalization,
          completed: shipment.selfServiceCompleted,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Complete self-service
   * @route POST /api/swag-orders/self-service/:token
   */
  completeSelfService = async (req, res, next) => {
    try {
      const order = await this.swagOrderService.completeSelfService(
        req.params.token,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ success: true }, "Đã lưu thông tin!"));
    } catch (error) {
      next(error);
    }
  };
}
