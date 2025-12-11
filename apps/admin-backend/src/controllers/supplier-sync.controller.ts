import { Request, Response, NextFunction } from "express";
import { Logger } from "../shared/utils/logger.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { SupplierSyncService } from "../services/supplier-sync.service.js";
import { ValidationException } from "../shared/exceptions/index.js";

/**
 * Supplier Sync Controller
 *
 * Handles supplier synchronization and webhooks
 */
export class SupplierSyncController {
  private syncService: SupplierSyncService;

  constructor() {
    this.syncService = new SupplierSyncService();
  }

  /**
   * Sync inventory from supplier
   * @route POST /api/admin/sync/inventory/:supplierId
   */
  syncInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;

      Logger.info(
        `[SupplierSyncCtrl] Manual inventory sync triggered for supplier: ${supplierId}`
      );

      const result = await this.syncService.syncInventory(supplierId);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Inventory sync complete: ${result.updated} updated, ${result.errors} errors`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sync pricing from supplier
   * @route POST /api/admin/sync/pricing/:supplierId
   */
  syncPricing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;

      Logger.info(
        `[SupplierSyncCtrl] Manual pricing sync triggered for supplier: ${supplierId}`
      );

      const result = await this.syncService.syncPricing(supplierId);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Pricing sync complete: ${result.updated} updated, ${result.errors} errors`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sync catalog from supplier
   * @route POST /api/admin/sync/catalog/:supplierId
   */
  syncCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;

      Logger.info(
        `[SupplierSyncCtrl] Manual catalog sync triggered for supplier: ${supplierId}`
      );

      const result = await this.syncService.syncCatalog(supplierId);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Catalog sync complete: ${result.newProducts} new, ${result.updatedProducts} updated`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Printful webhook
   * @route POST /api/webhooks/suppliers/printful
   */
  handlePrintfulWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { type, data } = req.body;

      Logger.info(`[SupplierSyncCtrl] Printful webhook received: ${type}`);

      await this.syncService.handleWebhook("printful", type, data);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Webhook processed"));
    } catch (error) {
      Logger.error("[SupplierSyncCtrl] Webhook processing failed:", error);
      // Return 200 to prevent webhook retries
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Webhook received"));
    }
  };

  /**
   * Handle CustomCat webhook
   * @route POST /api/webhooks/suppliers/customcat
   */
  handleCustomCatWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { event, data } = req.body;

      Logger.info(`[SupplierSyncCtrl] CustomCat webhook received: ${event}`);

      await this.syncService.handleWebhook("customcat", event, data);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Webhook processed"));
    } catch (error) {
      Logger.error("[SupplierSyncCtrl] Webhook processing failed:", error);
      // Return 200 to prevent webhook retries
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Webhook received"));
    }
  };
}
