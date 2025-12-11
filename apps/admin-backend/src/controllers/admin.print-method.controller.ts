// @ts-nocheck
// apps/admin-backend/src/controllers/admin.print-method.controller.ts
// ✅ Print Method Configuration Controller
// Phase 3.1.1: Implement Print Method Configuration

import { Request, Response, NextFunction } from "express";
import printMethodService from "../services/catalog.print-method.service.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Controller for managing print methods and customization configuration
 */
export class PrintMethodController {
  /**
   * Configure print methods for a product
   * @route PUT /api/admin/catalog/products/:id/print-methods
   */
  configurePrintMethods = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { printMethods } = req.body;

      Logger.debug(
        `[PrintMethodCtrl] Configuring print methods for product: ${id}`
      );

      const product = await printMethodService.configurePrintMethods(
        id,
        printMethods
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { product },
            "Print methods configured successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add a single print method to a product
   * @route POST /api/admin/catalog/products/:id/print-methods
   */
  addPrintMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const printMethod = req.body;

      Logger.debug(
        `[PrintMethodCtrl] Adding print method ${printMethod.method} to product: ${id}`
      );

      const product = await printMethodService.addPrintMethod(id, printMethod);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ product }, "Print method added successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove a print method from a product
   * @route DELETE /api/admin/catalog/products/:id/print-methods/:method
   */
  removePrintMethod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, method } = req.params;

      Logger.debug(
        `[PrintMethodCtrl] Removing print method ${method} from product: ${id}`
      );

      const product = await printMethodService.removePrintMethod(id, method);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ product }, "Print method removed successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Configure MOQ per print method
   * @route PUT /api/admin/catalog/products/:id/moq-by-print-method
   */
  configureMoq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { moqConfig } = req.body;

      Logger.debug(`[PrintMethodCtrl] Configuring MOQ for product: ${id}`);

      const product = await printMethodService.configureMoqByPrintMethod(
        id,
        moqConfig
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ product }, "MOQ configured successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set production complexity
   * @route PUT /api/admin/catalog/products/:id/production-complexity
   */
  setProductionComplexity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const complexity = req.body;

      Logger.debug(
        `[PrintMethodCtrl] Setting production complexity for product: ${id}`
      );

      const product = await printMethodService.setProductionComplexity(
        id,
        complexity
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { product },
            "Production complexity set successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Calculate customization cost
   * @route POST /api/admin/catalog/products/:id/calculate-customization-cost
   */
  calculateCustomizationCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { printMethod, selectedAreas, quantity } = req.body;

      Logger.debug(
        `[PrintMethodCtrl] Calculating customization cost for product: ${id}`
      );

      // Get product to access print methods
      const availableMethods =
        await printMethodService.getAvailablePrintMethods(id);
      const method = availableMethods.find((m) => m.method === printMethod);

      if (!method) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("Print method not found"));
      }

      const cost = printMethodService.calculateCustomizationCost(
        method,
        selectedAreas,
        quantity
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cost }, "Cost calculated successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate artwork
   * @route POST /api/admin/catalog/products/:id/validate-artwork
   */
  validateArtwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { printMethod, artwork } = req.body;

      Logger.debug(`[PrintMethodCtrl] Validating artwork for product: ${id}`);

      // Get product to access print methods
      const availableMethods =
        await printMethodService.getAvailablePrintMethods(id);
      const method = availableMethods.find((m) => m.method === printMethod);

      if (!method) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("Print method not found"));
      }

      const validation = printMethodService.validateArtwork(artwork, method);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { validation },
            validation.isValid
              ? "Artwork is valid"
              : "Artwork validation failed"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get MOQ for a print method
   * @route GET /api/admin/catalog/products/:id/moq/:method
   */
  getMoq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, method } = req.params;

      Logger.debug(
        `[PrintMethodCtrl] Getting MOQ for print method ${method} on product: ${id}`
      );

      const moq = await printMethodService.getMoqForPrintMethod(id, method);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ moq }, "MOQ retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Estimate lead time
   * @route POST /api/admin/catalog/products/:id/estimate-lead-time
   */
  estimateLeadTime = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { printMethod, quantity } = req.body;

      Logger.debug(`[PrintMethodCtrl] Estimating lead time for product: ${id}`);

      const estimate = await printMethodService.estimateLeadTime(
        id,
        printMethod,
        quantity
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ estimate }, "Lead time estimated successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get available print methods
   * @route GET /api/admin/catalog/products/:id/print-methods
   */
  getAvailablePrintMethods = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      Logger.debug(
        `[PrintMethodCtrl] Getting available print methods for product: ${id}`
      );

      const printMethods = await printMethodService.getAvailablePrintMethods(
        id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { printMethods },
            "Print methods retrieved successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Apply default print method template
   * @route POST /api/admin/catalog/products/:id/apply-default-print-method
   */
  applyDefaultPrintMethod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { templateName } = req.body;

      Logger.debug(
        `[PrintMethodCtrl] Applying default print method ${templateName} to product: ${id}`
      );

      const product = await printMethodService.applyDefaultPrintMethod(
        id,
        templateName
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { product },
            "Default print method applied successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}

export default new PrintMethodController();
