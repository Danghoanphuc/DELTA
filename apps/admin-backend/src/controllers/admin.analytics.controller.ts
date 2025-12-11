/**
 * Analytics Controller
 *
 * Handles HTTP requests for analytics and reporting
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { ValidationException } from "../shared/exceptions/index.js";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get product analytics
   * @route GET /api/admin/analytics/products
   * Requirements: 13.1, 13.4
   */
  getProductAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { startDate, endDate, topN, slowMovingThreshold } = req.query;

      // Validate and parse dates
      if (!startDate || !endDate) {
        throw new ValidationException("Start date and end date are required");
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };

      const options = {
        topN: topN ? parseInt(topN as string) : undefined,
        slowMovingThreshold: slowMovingThreshold
          ? parseInt(slowMovingThreshold as string)
          : undefined,
      };

      const analytics = await this.analyticsService.getProductAnalytics(
        organizationId,
        dateRange,
        options
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { analytics },
            "Product analytics retrieved successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get supplier analytics
   * @route GET /api/admin/analytics/suppliers
   * Requirements: 13.2
   */
  getSupplierAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { startDate, endDate } = req.query;

      // Validate and parse dates
      if (!startDate || !endDate) {
        throw new ValidationException("Start date and end date are required");
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };

      const analytics = await this.analyticsService.getSupplierAnalytics(
        organizationId,
        dateRange
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { analytics },
            "Supplier analytics retrieved successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order analytics
   * @route GET /api/admin/analytics/orders
   * Requirements: 13.3
   */
  getOrderAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { startDate, endDate, groupBy } = req.query;

      // Validate and parse dates
      if (!startDate || !endDate) {
        throw new ValidationException("Start date and end date are required");
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };

      const groupByPeriod = (groupBy as "day" | "week" | "month") || "month";

      const analytics = await this.analyticsService.getOrderAnalytics(
        organizationId,
        dateRange,
        groupByPeriod
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { analytics },
            "Order analytics retrieved successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export analytics report
   * @route GET /api/admin/analytics/export
   * Requirements: 13.5
   */
  exportReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { reportType, startDate, endDate, format } = req.query;

      // Validate parameters
      if (!reportType) {
        throw new ValidationException("Report type is required");
      }

      if (!startDate || !endDate) {
        throw new ValidationException("Start date and end date are required");
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };

      const reportFormat = (format as "csv" | "excel") || "csv";

      const report = await this.analyticsService.exportReport(
        organizationId,
        reportType as "products" | "suppliers" | "orders",
        dateRange,
        reportFormat
      );

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${report.filename}"`
      );
      res.send(report.data);
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export const analyticsController = new AnalyticsController();
