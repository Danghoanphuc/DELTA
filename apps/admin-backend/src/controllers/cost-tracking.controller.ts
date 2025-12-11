/**
 * Cost Tracking Controller
 *
 * Handle HTTP requests cho cost và margin tracking:
 * - Get cost breakdown
 * - Get margin reports
 * - Update actual costs
 * - Get variance analysis
 *
 * Requirements: 15.1, 15.2, 15.4, 15.5
 */

import { Request, Response, NextFunction } from "express";
import { CostCalculationService } from "../services/cost-calculation.service.js";
import { MarginCalculationService } from "../services/margin-calculation.service.js";
import { VarianceAnalysisService } from "../services/variance-analysis.service.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { Logger } from "../shared/utils/logger.js";

export class CostTrackingController {
  private readonly costCalculationService: CostCalculationService;
  private readonly marginCalculationService: MarginCalculationService;
  private readonly varianceAnalysisService: VarianceAnalysisService;

  constructor() {
    this.costCalculationService = new CostCalculationService();
    this.marginCalculationService = new MarginCalculationService();
    this.varianceAnalysisService = new VarianceAnalysisService();
  }

  /**
   * Get cost breakdown for order
   * @route GET /api/admin/costs/:orderId
   */
  getCostBreakdown = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;

      Logger.debug(
        `[CostTrackingCtrl] Getting cost breakdown for order: ${orderId}`
      );

      const breakdown = await this.costCalculationService.getCostBreakdown(
        orderId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ breakdown }, "Đã lấy cost breakdown"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get margin report
   * @route GET /api/admin/costs/margin-report
   */
  getMarginReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      Logger.debug(
        `[CostTrackingCtrl] Getting margin report from ${startDate} to ${endDate}`
      );

      // Parse dates
      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const report = await this.marginCalculationService.generateMarginReport(
        dateRange
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ report }, "Đã tạo margin report"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update actual cost for production order
   * @route PUT /api/admin/costs/:productionOrderId/actual
   */
  updateActualCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productionOrderId } = req.params;
      const { actualCost, costBreakdown, notes } = req.body;

      Logger.debug(
        `[CostTrackingCtrl] Updating actual cost for PO ${productionOrderId}: ${actualCost}`
      );

      const productionOrder =
        await this.varianceAnalysisService.recordActualCost(
          productionOrderId,
          actualCost,
          costBreakdown,
          notes
        );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ productionOrder }, "Đã cập nhật actual cost")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get variance analysis
   * @route GET /api/admin/costs/variance
   */
  getVarianceAnalysis = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { startDate, endDate } = req.query;

      Logger.debug(
        `[CostTrackingCtrl] Getting variance analysis from ${startDate} to ${endDate}`
      );

      // Parse dates
      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const analysis =
        await this.varianceAnalysisService.generateVarianceReport(dateRange);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ analysis }, "Đã tạo variance analysis"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get variance for specific order
   * @route GET /api/admin/costs/:orderId/variance
   */
  getOrderVariance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;

      Logger.debug(`[CostTrackingCtrl] Getting variance for order: ${orderId}`);

      const variance = await this.varianceAnalysisService.calculateVariance(
        orderId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ variance }, "Đã tính variance"));
    } catch (error) {
      next(error);
    }
  };
}
