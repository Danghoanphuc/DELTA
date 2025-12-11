// src/controllers/admin.shipping.controller.ts
// ✅ Shipping Controller - HTTP handlers cho shipping operations
// Tuân thủ SOLID: SRP (chỉ handle HTTP)

import { Request, Response, NextFunction } from "express";
import { shippingService } from "../services/shipping.service";
import { Logger } from "../shared/utils/logger.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response";

/**
 * Shipping Controller
 * Responsibilities:
 * - Handle HTTP requests for shipping operations
 * - Validate request data
 * - Return appropriate responses
 */
export class ShippingController {
  /**
   * Create shipment for a recipient
   * @route POST /api/admin/shipments
   */
  createShipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, recipientId, carrierId, packageDetails } = req.body;

      // Validation
      if (!orderId || !recipientId || !carrierId) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error(
              "VALIDATION_ERROR",
              "orderId, recipientId, và carrierId là bắt buộc"
            )
          );
      }

      if (!packageDetails || !packageDetails.weight) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error(
              "VALIDATION_ERROR",
              "packageDetails với weight là bắt buộc"
            )
          );
      }

      const result = await shippingService.createShipment(
        orderId,
        recipientId,
        carrierId,
        packageDetails
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success(result, "Đã tạo vận đơn thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create bulk shipments for order
   * @route POST /api/admin/shipments/bulk
   */
  createBulkShipments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId, carrierId, recipientIds, packageDetails } = req.body;

      if (!orderId || !carrierId) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error(
              "VALIDATION_ERROR",
              "orderId và carrierId là bắt buộc"
            )
          );
      }

      const result = await shippingService.createBulkShipments(
        orderId,
        carrierId,
        recipientIds,
        packageDetails
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            result,
            `Đã tạo ${result.success} vận đơn, ${result.failed} lỗi`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get tracking info for shipment
   * @route GET /api/admin/shipments/:orderId/recipients/:recipientId/tracking
   */
  getTracking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, recipientId } = req.params;

      const result = await shippingService.getTracking(orderId, recipientId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Lấy thông tin tracking thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel shipment
   * @route POST /api/admin/shipments/:orderId/recipients/:recipientId/cancel
   */
  cancelShipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, recipientId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("VALIDATION_ERROR", "Lý do hủy là bắt buộc"));
      }

      const result = await shippingService.cancelShipment(
        orderId,
        recipientId,
        reason
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Đã hủy vận đơn thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get available carriers
   * @route GET /api/admin/shipments/carriers
   */
  getCarriers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const carriers = shippingService.getCarriers();

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ carriers }, "Lấy danh sách carriers thành công")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Calculate shipping fee
   * @route POST /api/admin/shipments/calculate-fee
   */
  calculateFee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { carrierId, fromDistrict, toDistrict, weight } = req.body;

      if (!carrierId || !toDistrict || !weight) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error(
              "VALIDATION_ERROR",
              "carrierId, toDistrict, và weight là bắt buộc"
            )
          );
      }

      const result = await shippingService.calculateFee(
        carrierId,
        fromDistrict || "Hà Nội",
        toDistrict,
        weight
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Tính phí vận chuyển thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle carrier webhook
   * @route POST /api/webhooks/carriers/:carrier
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { carrier } = req.params;
      const payload = req.body;

      Logger.debug(`[ShippingCtrl] Received webhook from ${carrier}`);

      const result = await shippingService.handleWebhook(carrier, payload);

      // Always return 200 to carrier
      res.status(API_CODES.SUCCESS).json(result);
    } catch (error) {
      Logger.error(`[ShippingCtrl] Webhook error:`, error);
      // Still return 200 to avoid carrier retries
      res.status(API_CODES.SUCCESS).json({ success: false });
    }
  };
}

export const shippingController = new ShippingController();
