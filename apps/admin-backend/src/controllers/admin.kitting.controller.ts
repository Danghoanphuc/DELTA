// apps/admin-backend/src/controllers/admin.kitting.controller.ts
// ✅ Kitting Controller - Phase 6.1.2
// HTTP handlers cho kitting operations

import { Request, Response, NextFunction } from "express";
import { KittingService } from "../services/kitting.service.js";
import { Logger } from "../shared/utils/logger.js";
import { API_CODES } from "../shared/constants";

// ============================================
// KITTING CONTROLLER
// ============================================

export class KittingController {
  private kittingService: KittingService;

  constructor() {
    this.kittingService = new KittingService();
  }

  /**
   * Get kitting queue
   * @route GET /api/admin/kitting/queue
   * Requirements: 8.1
   */
  getKittingQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.debug(`[KittingCtrl] GET /kitting/queue`);

      const { status, priority, sortBy } = req.query;

      const orders = await this.kittingService.getKittingQueue({
        status: status as string,
        priority: priority as string,
        sortBy: sortBy as string,
      });

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { orders, count: orders.length },
        message: "Lấy danh sách kitting thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get kitting checklist for an order
   * @route GET /api/admin/kitting/:orderId/checklist
   * Requirements: 8.1, 8.2
   */
  getKittingChecklist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      Logger.debug(`[KittingCtrl] GET /kitting/${orderId}/checklist`);

      const checklist = await this.kittingService.generateKittingChecklist(
        orderId
      );

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { checklist },
        message: "Lấy checklist thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Start kitting process
   * @route POST /api/admin/kitting/:orderId/start
   * Requirements: 8.2
   */
  startKitting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user._id;

      Logger.debug(`[KittingCtrl] POST /kitting/${orderId}/start`);

      const order = await this.kittingService.startKitting(orderId, userId);

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { order },
        message: "Bắt đầu kitting thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Scan item during kitting
   * @route POST /api/admin/kitting/:orderId/scan
   * Requirements: 8.2, 8.3
   */
  scanItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { sku, quantity } = req.body;
      const userId = (req as any).user._id;

      Logger.debug(`[KittingCtrl] POST /kitting/${orderId}/scan - SKU: ${sku}`);

      const scanResult = await this.kittingService.scanItem(orderId, {
        sku,
        quantity,
        scannedBy: userId,
      });

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { scanResult },
        message: `Đã scan ${sku}`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Complete kitting process
   * @route POST /api/admin/kitting/:orderId/complete
   * Requirements: 8.3, 8.4
   */
  completeKitting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user._id;

      Logger.debug(`[KittingCtrl] POST /kitting/${orderId}/complete`);

      const order = await this.kittingService.completeKitting(orderId, userId);

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { order },
        message: "Hoàn tất kitting thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get kitting progress
   * @route GET /api/admin/kitting/:orderId/progress
   * Requirements: 8.2
   */
  getKittingProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      Logger.debug(`[KittingCtrl] GET /kitting/${orderId}/progress`);

      const progress = await this.kittingService.getKittingProgress(orderId);

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate inventory for kitting
   * @route GET /api/admin/kitting/:orderId/validate-inventory
   * Requirements: 8.2
   */
  validateInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      Logger.debug(`[KittingCtrl] GET /kitting/${orderId}/validate-inventory`);

      const validation = await this.kittingService.validateInventoryForKitting(
        orderId
      );

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { validation },
        message: validation.allAvailable
          ? "Tồn kho đủ để kitting"
          : "Tồn kho không đủ",
      });
    } catch (error) {
      next(error);
    }
  };
}
