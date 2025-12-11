import { Request, Response, NextFunction } from "express";
import { Logger } from "../shared/utils/logger.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { SupplierRoutingService } from "../services/supplier-routing.service.js";
import { SkuTranslationService } from "../services/sku-translation.service.js";
import { SupplierAdapterFactory } from "../services/suppliers/supplier-adapter.factory.js";
import { ValidationException } from "../shared/exceptions/index.js";

/**
 * Supplier Routing Controller
 *
 * Handles supplier selection and order routing
 */
export class SupplierRoutingController {
  private routingService: SupplierRoutingService;

  constructor() {
    const translationService = new SkuTranslationService();
    const adapterFactory = new SupplierAdapterFactory();
    this.routingService = new SupplierRoutingService(
      translationService,
      adapterFactory
    );
  }

  /**
   * Select best supplier for a SKU
   * @route POST /api/admin/routing/select-supplier
   */
  selectSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku, quantity } = req.body;

      if (!sku || !quantity) {
        throw new ValidationException("SKU and quantity are required");
      }

      Logger.debug(
        `[SupplierRoutingCtrl] Selecting supplier for SKU: ${sku}, quantity: ${quantity}`
      );

      const supplier = await this.routingService.selectSupplier(sku, quantity);

      if (!supplier) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(
            ApiResponse.error(
              "No available supplier found for this SKU and quantity"
            )
          );
      }

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ supplier }, "Supplier selected successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route entire order to suppliers
   * @route POST /api/admin/routing/route-order
   */
  routeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderItems } = req.body;

      if (!orderItems || !Array.isArray(orderItems)) {
        throw new ValidationException("Order items array is required");
      }

      Logger.debug(
        `[SupplierRoutingCtrl] Routing order with ${orderItems.length} items`
      );

      const routingPlan = await this.routingService.routeOrder(orderItems);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success(
          {
            routes: Array.from(routingPlan.routes.values()),
            unroutableItems: routingPlan.unroutableItems,
          },
          "Order routed successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check inventory across all suppliers
   * @route GET /api/admin/routing/inventory/:sku
   */
  checkInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku } = req.params;

      Logger.debug(`[SupplierRoutingCtrl] Checking inventory for SKU: ${sku}`);

      const summary = await this.routingService.checkInventoryAcrossSuppliers(
        sku
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { inventory: summary },
            "Inventory checked successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get routing statistics
   * @route GET /api/admin/routing/statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              startDate: new Date(startDate as string),
              endDate: new Date(endDate as string),
            }
          : undefined;

      const statistics = await this.routingService.getRoutingStatistics(
        dateRange
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { statistics },
            "Statistics retrieved successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
