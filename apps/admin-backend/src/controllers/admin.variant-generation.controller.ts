// apps/admin-backend/src/controllers/admin.variant-generation.controller.ts
// ✅ Phase 3.1.3: Variant Generation Controller

import { Request, Response, NextFunction } from "express";
import { variantGenerationService } from "../services/catalog.variant-generation.service.js";
import { ValidationException } from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.js";

const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
};

class ApiResponse {
  static success(data: any, message?: string) {
    return {
      success: true,
      data,
      message,
    };
  }
}

/**
 * Controller for variant generation operations
 */
export class VariantGenerationController {
  /**
   * Generate variants for a product
   * POST /api/admin/catalog/products/:productId/generate-variants
   */
  generateVariants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.params;
      const { attributeOptions, options } = req.body;

      Logger.debug(
        `[VariantGenCtrl] Generate variants for product: ${productId}`
      );

      // Validation
      if (!attributeOptions || !Array.isArray(attributeOptions)) {
        throw new ValidationException(
          "attributeOptions is required and must be an array"
        );
      }

      if (attributeOptions.length === 0) {
        throw new ValidationException(
          "At least one attribute option is required"
        );
      }

      // Validate each attribute option
      for (const attr of attributeOptions) {
        if (!attr.name || !attr.values || !Array.isArray(attr.values)) {
          throw new ValidationException(
            "Each attribute option must have name and values array"
          );
        }

        if (attr.values.length === 0) {
          throw new ValidationException(
            `Attribute ${attr.name} must have at least one value`
          );
        }
      }

      // Generate variants
      const variants = await variantGenerationService.generateVariants(
        productId,
        attributeOptions,
        options
      );

      Logger.success(`[VariantGenCtrl] Generated ${variants.length} variants`);

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            { variants, count: variants.length },
            `Successfully generated ${variants.length} variants`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Preview variant combinations without creating
   * POST /api/admin/catalog/products/:productId/preview-variants
   */
  previewVariants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { attributeOptions } = req.body;

      Logger.debug(
        `[VariantGenCtrl] Preview variants for product: ${productId}`
      );

      // Validation
      if (!attributeOptions || !Array.isArray(attributeOptions)) {
        throw new ValidationException(
          "attributeOptions is required and must be an array"
        );
      }

      // Generate combinations
      const combinations =
        variantGenerationService.generateAttributeCombinations(
          attributeOptions
        );

      // Generate preview data
      const previews = combinations.slice(0, 100).map((attrs, index) => {
        const sku = variantGenerationService.generateSku(`PREVIEW`, attrs);
        const name = variantGenerationService.generateVariantName(
          "Product",
          attrs
        );

        return {
          index: index + 1,
          sku,
          name,
          attributes: attrs,
        };
      });

      Logger.success(
        `[VariantGenCtrl] Generated ${combinations.length} preview combinations`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          totalCombinations: combinations.length,
          previews,
          truncated: combinations.length > 100,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update supplier mapping for a variant
   * PUT /api/admin/catalog/variants/:variantId/supplier-mapping
   */
  updateSupplierMapping = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const { supplierId, mapping } = req.body;

      Logger.debug(
        `[VariantGenCtrl] Update supplier mapping: ${variantId} -> ${supplierId}`
      );

      // Validation
      if (!supplierId) {
        throw new ValidationException("supplierId is required");
      }

      if (!mapping) {
        throw new ValidationException("mapping is required");
      }

      // Update mapping
      const result = await variantGenerationService.updateSupplierMapping(
        variantId,
        supplierId,
        mapping
      );

      Logger.success(
        `[VariantGenCtrl] Updated supplier mapping for variant: ${variantId}`
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(result, "Supplier mapping updated successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update inventory for a variant
   * PUT /api/admin/catalog/variants/:variantId/inventory
   */
  updateInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const updates = req.body;

      Logger.debug(
        `[VariantGenCtrl] Update inventory for variant: ${variantId}`
      );

      // Update inventory
      const variant = await variantGenerationService.updateInventory(
        variantId,
        updates
      );

      Logger.success(
        `[VariantGenCtrl] Updated inventory for variant: ${variantId}`
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ variant }, "Inventory updated successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low stock variants
   * GET /api/admin/catalog/variants/low-stock
   */
  getLowStockVariants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { threshold } = req.query;

      Logger.debug(
        `[VariantGenCtrl] Get low stock variants (threshold: ${threshold})`
      );

      const variants = await variantGenerationService.getLowStockVariants(
        threshold ? parseInt(threshold as string) : undefined
      );

      Logger.success(
        `[VariantGenCtrl] Found ${variants.length} low stock variants`
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ variants, count: variants.length }));
    } catch (error) {
      next(error);
    }
  };
}

export const variantGenerationController = new VariantGenerationController();
export default variantGenerationController;
