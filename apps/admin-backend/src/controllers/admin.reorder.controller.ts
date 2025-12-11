/**
 * ReorderController - Re-order API Controller
 *
 * HTTP handlers for re-order endpoints
 * Implements Instant Re-order feature
 *
 * Requirements: 7.1, 7.3
 */

import { Request, Response, NextFunction } from "express";
import { ReorderService, reorderService } from "../services/reorder.service.js";
import { Logger } from "../utils/logger.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { ApiResponse } from "../shared/utils/api-response.js";

/**
 * ReorderController - HTTP handlers for re-order operations
 */
export class ReorderController {
  private reorderService: ReorderService;

  constructor(service: ReorderService = reorderService) {
    this.reorderService = service;
  }

  /**
   * Create re-order from original order
   * @route POST /api/orders/:orderId/reorder
   * Requirements: 7.1 - Create re-order with same specifications and FINAL files
   */
  createReorder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user?._id?.toString();

      if (!userId) {
        res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
        return;
      }

      Logger.debug(
        `[ReorderCtrl] Creating re-order from order: ${orderId} by user: ${userId}`
      );

      // Create re-order
      const result = await this.reorderService.createReorder(orderId, userId);

      res.status(API_CODES.CREATED).json(
        ApiResponse.success(
          {
            reorder: result,
          },
          "Đã tạo đơn hàng tái bản thành công!"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get re-order preview with price comparison
   * @route GET /api/orders/:orderId/reorder-preview
   * Requirements: 7.3 - Preview with price comparison
   */
  getReorderPreview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;

      Logger.debug(`[ReorderCtrl] Getting re-order preview for: ${orderId}`);

      // Get preview
      const preview = await this.reorderService.getReorderPreview(orderId);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          preview,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export const reorderController = new ReorderController();
