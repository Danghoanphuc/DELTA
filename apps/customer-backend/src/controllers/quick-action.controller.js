// apps/customer-backend/src/controllers/quick-action.controller.js
// Quick Action Controller for ORDER Context

import logger from "../infrastructure/logger.js";
import { QuickActionService } from "../services/quick-action.service.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";

export class QuickActionController {
  constructor() {
    this.quickActionService = new QuickActionService();
  }

  /**
   * Get available quick actions for an order
   * @route GET /api/orders/:orderId/quick-actions
   */
  getQuickActionsForOrder = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id.toString();

      logger.debug(
        `[QuickActionCtrl] GET /api/orders/${orderId}/quick-actions`
      );

      // Validate permission
      const hasPermission =
        await this.quickActionService.validateQuickActionPermission(
          orderId,
          userId
        );

      if (!hasPermission) {
        throw new ForbiddenException(
          "Bạn không có quyền xem quick actions cho đơn hàng này"
        );
      }

      const quickActions =
        await this.quickActionService.getQuickActionsForOrder(orderId, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { quickActions },
            "Lấy danh sách quick actions thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Execute a quick action
   * @route POST /api/orders/:orderId/quick-actions/:action
   */
  executeQuickAction = async (req, res, next) => {
    try {
      const { orderId, action } = req.params;
      const userId = req.user._id.toString();
      const data = req.body;

      logger.debug(
        `[QuickActionCtrl] POST /api/orders/${orderId}/quick-actions/${action}`
      );

      // Validate permission
      const hasPermission =
        await this.quickActionService.validateQuickActionPermission(
          orderId,
          userId
        );

      if (!hasPermission) {
        throw new ForbiddenException(
          "Bạn không có quyền thực hiện quick action này"
        );
      }

      const thread = await this.quickActionService.executeQuickAction(
        action,
        orderId,
        userId,
        data
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ thread }, "Thực hiện quick action thành công")
        );
    } catch (error) {
      next(error);
    }
  };
}
