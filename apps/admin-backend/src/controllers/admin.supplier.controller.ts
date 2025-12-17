/**
 * Admin Supplier Controller
 * Handles supplier management and performance tracking endpoints
 *
 * Phase 8.1.3: Supplier Controller & Routes
 */

import { Request, Response, NextFunction } from "express";
import { SupplierService } from "../services/supplier.service.js";
import { SupplierPostService } from "../services/supplier-post.service.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../shared/utils/logger.js";

export class AdminSupplierController {
  private supplierService: SupplierService;
  private supplierPostService: SupplierPostService;

  constructor() {
    this.supplierService = new SupplierService();
    this.supplierPostService = new SupplierPostService();
  }

  /**
   * Get supplier performance metrics
   * @route GET /api/admin/suppliers/:id/performance
   */
  getSupplierPerformance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      Logger.debug(
        `[AdminSupplierCtrl] Getting performance for supplier: ${id}`
      );

      const performance = await this.supplierService.getSupplierPerformance(id);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { performance },
            "Đã lấy performance metrics của supplier"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get supplier lead time history
   * @route GET /api/admin/suppliers/:id/lead-time-history
   */
  getLeadTimeHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      Logger.debug(
        `[AdminSupplierCtrl] Getting lead time history for supplier: ${id}`
      );

      const history = await this.supplierService.getLeadTimeHistory(id);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { history },
            "Đã lấy lead time history của supplier"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update supplier rating
   * @route PUT /api/admin/suppliers/:id/rating
   */
  updateSupplierRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      Logger.debug(
        `[AdminSupplierCtrl] Updating rating for supplier ${id} to ${rating}`
      );

      await this.supplierService.updateSupplierRating(id, rating);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã cập nhật rating của supplier"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Compare suppliers
   * @route GET /api/admin/suppliers/compare
   */
  compareSuppliers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { supplierIds } = req.query;

      Logger.debug(`[AdminSupplierCtrl] Comparing suppliers`);

      const ids = supplierIds ? (supplierIds as string).split(",") : undefined;

      const comparison = await this.supplierService.compareSuppliers(ids);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ suppliers: comparison }, "Đã so sánh suppliers")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get top performing suppliers
   * @route GET /api/admin/suppliers/top
   */
  getTopSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query;

      Logger.debug(`[AdminSupplierCtrl] Getting top suppliers`);

      const suppliers = await this.supplierService.getTopSuppliers(
        limit ? parseInt(limit as string) : 10
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ suppliers }, "Đã lấy danh sách top suppliers")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low performing suppliers
   * @route GET /api/admin/suppliers/low-performing
   */
  getLowPerformingSuppliers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { onTimeThreshold, qualityThreshold } = req.query;

      Logger.debug(`[AdminSupplierCtrl] Getting low performing suppliers`);

      const suppliers = await this.supplierService.getLowPerformingSuppliers(
        onTimeThreshold ? parseInt(onTimeThreshold as string) : 80,
        qualityThreshold ? parseInt(qualityThreshold as string) : 90
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { suppliers },
            "Đã lấy danh sách suppliers có performance thấp"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh all supplier metrics
   * @route POST /api/admin/suppliers/refresh-metrics
   */
  refreshAllMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      Logger.debug(`[AdminSupplierCtrl] Refreshing all supplier metrics`);

      await this.supplierService.refreshAllMetrics();

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(null, "Đã refresh metrics cho tất cả suppliers")
        );
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // SUPPLIER POSTS METHODS
  // ============================================

  /**
   * Create post for supplier
   * @route POST /api/admin/suppliers/:supplierId/posts
   */
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;
      const user = (req as any).user;

      // Temporary: Use a default admin ID if user is not authenticated
      // TODO: Fix authentication middleware properly
      const userId = user?._id || "000000000000000000000000";

      const post = await this.supplierPostService.createPost(
        supplierId,
        userId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ post }, "Đã đăng bài thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get posts by supplier
   * @route GET /api/admin/suppliers/:supplierId/posts
   */
  getPostsBySupplier = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { supplierId } = req.params;
      const { visibility, page, limit } = req.query;

      const result = await this.supplierPostService.getPostsBySupplier(
        supplierId,
        {
          visibility: visibility as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}
