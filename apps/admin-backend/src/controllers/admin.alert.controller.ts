/**
 * Alert Controller
 *
 * HTTP handlers for alert management
 */

import { Request, Response, NextFunction } from "express";
import { AlertService } from "../services/alert.service.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { ApiResponse } from "../shared/utils/api-response.js";

export class AlertController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  /**
   * Get pending alerts for the current user
   * @route GET /api/alerts
   */
  getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
      }

      const alerts = await this.alertService.getPendingAlerts(
        userId.toString()
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ alerts }, "Đã tải danh sách cảnh báo"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get alert statistics for the current user
   * @route GET /api/alerts/stats
   */
  getAlertStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
      }

      const stats = await this.alertService.getAlertStats(userId.toString());

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ stats }, "Đã tải thống kê cảnh báo"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Acknowledge an alert
   * @route PUT /api/alerts/:id/acknowledge
   */
  acknowledgeAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
      }

      const alert = await this.alertService.acknowledgeAlert(
        id,
        userId.toString()
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ alert }, "Đã xác nhận cảnh báo"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get orders sorted by deadline urgency
   * @route GET /api/alerts/orders/urgent
   */
  getUrgentOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, includeCompleted } = req.query;

      const orders = await this.alertService.getOrdersByDeadlineUrgency({
        limit: limit ? parseInt(limit as string) : 50,
        includeCompleted: includeCompleted === "true",
      });

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ orders }, "Đã tải danh sách đơn hàng khẩn cấp")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get alert thresholds for a customer tier
   * @route GET /api/alerts/thresholds/:tier
   */
  getThresholds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tier } = req.params;

      const thresholds = await this.alertService.getAlertThresholds(tier);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thresholds }, "Đã tải ngưỡng cảnh báo"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Configure alert thresholds for a customer tier (Admin only)
   * @route PUT /api/alerts/thresholds/:tier
   */
  configureThresholds = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tier } = req.params;
      const { deadlineWarningHours, deadlineCriticalHours, escalationHours } =
        req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
      }

      const threshold = await this.alertService.configureThresholds(
        tier,
        {
          deadlineWarningHours,
          deadlineCriticalHours,
          escalationHours,
        },
        userId.toString()
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ threshold }, "Đã cấu hình ngưỡng cảnh báo")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Manually trigger deadline check (Admin only)
   * @route POST /api/alerts/check-deadlines
   */
  checkDeadlines = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.alertService.checkDeadlines();

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { result },
            "Đã kiểm tra deadline và tạo cảnh báo"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
