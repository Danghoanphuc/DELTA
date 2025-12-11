// @ts-nocheck
// apps/admin-backend/src/controllers/admin.production.controller.ts
// ✅ Production Order Controller
// Phase 5.1.3: Production Order Management - HTTP Layer

import { Request, Response, NextFunction } from "express";
import { ProductionService } from "../services/production.service.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import mongoose from "mongoose";

/**
 * Production Order Controller
 * Handles HTTP requests for production order management
 */
export class ProductionController {
  private productionService: ProductionService;

  constructor() {
    this.productionService = new ProductionService();
  }

  /**
   * Get production order by ID
   * @route GET /api/admin/production-orders/:id
   */
  getProductionOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const productionOrder = await this.productionService.getProductionOrder(
        id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrder },
            "Lấy thông tin production order thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production orders by swag order
   * @route GET /api/admin/production-orders/swag-order/:swagOrderId
   */
  getProductionOrdersBySwagOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { swagOrderId } = req.params;

      const productionOrders =
        await this.productionService.getProductionOrdersBySwagOrder(
          swagOrderId
        );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrders },
            "Lấy danh sách production orders thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production orders by supplier
   * @route GET /api/admin/production-orders/supplier/:supplierId
   */
  getProductionOrdersBySupplier = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { supplierId } = req.params;
      const { status, startDate, endDate, page, limit } = req.query;

      const options = {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      };

      const result = await this.productionService.getProductionOrdersBySupplier(
        supplierId,
        options
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            "Lấy danh sách production orders thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production orders by status
   * @route GET /api/admin/production-orders/status/:status
   */
  getProductionOrdersByStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status } = req.params;
      const { page, limit } = req.query;

      const options = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      };

      const result = await this.productionService.getProductionOrdersByStatus(
        status,
        options
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            "Lấy danh sách production orders thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get delayed production orders
   * @route GET /api/admin/production-orders/delayed
   */
  getDelayedProductionOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productionOrders =
        await this.productionService.getDelayedProductionOrders();

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrders },
            "Lấy danh sách production orders trễ hạn thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update production order status
   * @route PUT /api/admin/production-orders/:id/status
   */
  updateProductionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Unauthorized"));
      }

      const productionOrder =
        await this.productionService.updateProductionStatus(
          id,
          status,
          new mongoose.Types.ObjectId(userId),
          note
        );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrder },
            "Cập nhật trạng thái production order thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Perform QC check
   * @route POST /api/admin/production-orders/:id/qc
   */
  performQCCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { passed, photos, notes, issues } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Unauthorized"));
      }

      const qcData = {
        checkedBy: new mongoose.Types.ObjectId(userId),
        passed,
        photos,
        notes,
        issues,
      };

      const productionOrder = await this.productionService.performQCCheck(
        id,
        qcData
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrder },
            `QC check ${passed ? "passed" : "failed"} thành công`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Complete production order
   * @route POST /api/admin/production-orders/:id/complete
   */
  completeProduction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { actualCost } = req.body;

      const productionOrder = await this.productionService.completeProduction(
        id,
        actualCost
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { productionOrder },
            "Hoàn thành production order thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production statistics
   * @route GET /api/admin/production-orders/statistics
   */
  getProductionStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { supplierId } = req.query;

      const statistics = await this.productionService.getProductionStatistics(
        supplierId as string | undefined
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { statistics },
            "Lấy thống kê production thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
