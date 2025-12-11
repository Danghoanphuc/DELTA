/**
 * Production Status Controller
 *
 * HTTP handlers for production status management
 * Handles status updates, barcode scanning, timeline, and issue reporting
 */

import { Request, Response, NextFunction } from "express";
import { ProductionStatusService } from "../services/production-status.service.js";
import { API_CODES, ApiResponse } from "../shared/utils/index.js";

export class ProductionStatusController {
  private service: ProductionStatusService;

  constructor() {
    this.service = new ProductionStatusService();
  }

  /**
   * Update production status
   * @route PUT /api/production/:orderId/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { stage, substage, progress, notes } = req.body;
      const operatorId = req.user?._id;

      if (!operatorId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Unauthorized", API_CODES.UNAUTHORIZED));
      }

      const updatedOrder = await this.service.updateStatus(
        orderId,
        { stage, substage, progress, notes },
        operatorId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { order: updatedOrder },
            "Đã cập nhật trạng thái sản xuất"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle barcode scan
   * @route POST /api/production/scan
   */
  scanBarcode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { barcode, stationId } = req.body;
      const operatorId = req.user?._id;

      if (!operatorId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Unauthorized", API_CODES.UNAUTHORIZED));
      }

      const scanResult = await this.service.scanBarcode(
        barcode,
        stationId,
        operatorId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ scanResult }, "Đã quét mã vạch thành công")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production timeline
   * @route GET /api/production/:orderId/timeline
   */
  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const timeline = await this.service.getTimeline(orderId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ timeline }, "Đã lấy timeline sản xuất"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Report production issue
   * @route POST /api/production/:orderId/issues
   */
  reportIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { issueType, description, severity } = req.body;
      const reportedBy = req.user?._id;

      if (!reportedBy) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Unauthorized", API_CODES.UNAUTHORIZED));
      }

      await this.service.reportIssue(orderId, {
        issueType,
        description,
        reportedBy,
        severity,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã báo cáo vấn đề sản xuất"));
    } catch (error) {
      next(error);
    }
  };
}
