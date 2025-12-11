// apps/admin-backend/src/controllers/admin.inventory.controller.ts
// ✅ Inventory Controller - HTTP handlers for inventory management
// Phase 4.1.3: Create Inventory Controller & Routes

import { Request, Response, NextFunction } from "express";
import InventoryService from "../services/inventory.service.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Inventory Controller
 * Handles HTTP requests for inventory management
 */
export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get inventory overview
   * @route GET /api/admin/inventory
   */
  getInventoryOverview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      Logger.debug(`[InventoryCtrl] Getting inventory overview`);

      const overview = await this.inventoryService.getInventoryOverview();

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ overview }, "Inventory overview retrieved")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory levels for a variant
   * @route GET /api/admin/inventory/:variantId
   */
  getInventoryLevels = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;

      Logger.debug(`[InventoryCtrl] Getting inventory levels for ${variantId}`);

      const available = await this.inventoryService.getAvailableStock(
        variantId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ available }, "Inventory levels retrieved"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reserve inventory for an order
   * @route POST /api/admin/inventory/:variantId/reserve
   */
  reserveInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const { quantity, orderId, orderNumber, reason } = req.body;
      const performedBy = req.user._id.toString();

      Logger.debug(
        `[InventoryCtrl] Reserving ${quantity} units of ${variantId} for order ${orderNumber}`
      );

      await this.inventoryService.reserveInventory(
        variantId,
        quantity,
        orderId,
        orderNumber,
        performedBy,
        reason
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            null,
            `Reserved ${quantity} units for order ${orderNumber}`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Release reserved inventory
   * @route POST /api/admin/inventory/:variantId/release
   */
  releaseInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const { quantity, orderId, orderNumber, reason } = req.body;
      const performedBy = req.user._id.toString();

      Logger.debug(
        `[InventoryCtrl] Releasing ${quantity} units of ${variantId} from order ${orderNumber}`
      );

      await this.inventoryService.releaseInventory(
        variantId,
        quantity,
        orderId,
        orderNumber,
        performedBy,
        reason
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            null,
            `Released ${quantity} units from order ${orderNumber}`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Manual inventory adjustment
   * @route POST /api/admin/inventory/:variantId/adjust
   */
  adjustInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const { quantityChange, reason, notes } = req.body;
      const performedBy = req.user._id.toString();

      Logger.debug(
        `[InventoryCtrl] Adjusting inventory for ${variantId} by ${quantityChange}`
      );

      await this.inventoryService.adjustInventory(
        variantId,
        quantityChange,
        reason,
        performedBy,
        notes
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            null,
            `Inventory adjusted by ${quantityChange} units`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Record a purchase
   * @route POST /api/admin/inventory/:variantId/purchase
   */
  recordPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const {
        quantity,
        unitCost,
        purchaseOrderId,
        purchaseOrderNumber,
        notes,
      } = req.body;
      const performedBy = req.user._id.toString();

      Logger.debug(
        `[InventoryCtrl] Recording purchase of ${quantity} units for ${variantId}`
      );

      await this.inventoryService.recordPurchase(
        variantId,
        quantity,
        unitCost,
        purchaseOrderId,
        purchaseOrderNumber,
        performedBy,
        notes
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(null, `Recorded purchase of ${quantity} units`)
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Record a sale
   * @route POST /api/admin/inventory/:variantId/sale
   */
  recordSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const { quantity, unitCost, orderId, orderNumber } = req.body;
      const performedBy = req.user._id.toString();

      Logger.debug(
        `[InventoryCtrl] Recording sale of ${quantity} units for ${variantId}`
      );

      await this.inventoryService.recordSale(
        variantId,
        quantity,
        unitCost,
        orderId,
        orderNumber,
        performedBy
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, `Recorded sale of ${quantity} units`));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get transaction history for a variant
   * @route GET /api/admin/inventory/:variantId/transactions
   */
  getTransactionHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const { startDate, endDate, type, page, limit } = req.query;

      Logger.debug(
        `[InventoryCtrl] Getting transaction history for ${variantId}`
      );

      const result = await this.inventoryService.getTransactionHistory(
        variantId,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          type: type as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Transaction history retrieved"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low stock items
   * @route GET /api/admin/inventory/low-stock
   */
  getLowStockItems = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { threshold } = req.query;

      Logger.debug(`[InventoryCtrl] Getting low stock items`);

      const items = await this.inventoryService.getLowStockItems(
        threshold ? parseInt(threshold as string) : undefined
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { items, count: items.length },
            "Low stock items retrieved"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if order can be fulfilled
   * @route POST /api/admin/inventory/check-fulfillment
   */
  checkFulfillment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { items } = req.body;

      Logger.debug(
        `[InventoryCtrl] Checking fulfillment for ${items.length} items`
      );

      const result = await this.inventoryService.canFulfillOrder(items);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Fulfillment check completed"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory levels for multiple variants (bulk)
   * @route POST /api/admin/inventory/bulk-levels
   */
  getBulkInventoryLevels = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantIds } = req.body;

      Logger.debug(
        `[InventoryCtrl] Getting inventory levels for ${variantIds.length} variants`
      );

      const levels = await this.inventoryService.getInventoryLevelsBulk(
        variantIds
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ levels }, "Bulk inventory levels retrieved")
        );
    } catch (error) {
      next(error);
    }
  };
}

export default InventoryController;
