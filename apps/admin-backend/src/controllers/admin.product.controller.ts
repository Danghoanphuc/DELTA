// apps/admin-backend/src/controllers/admin.product.controller.ts
import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as productService from "../services/admin.product.service.js";
import { ValidationException } from "../shared/exceptions.js";
import { PrintMethodService } from "../services/catalog.print-method.service.js";
import { PricingService } from "../services/catalog.pricing.service.js";
import { Logger } from "../shared/utils/logger.js";

const printMethodService = new PrintMethodService();
const pricingService = new PricingService();

export const handleGetAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, data: result });
  }
);

export const handleGetProductById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  }
);

export const handleUpdateProductStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, isPublished } = req.body;
    if (!status || isPublished === undefined) {
      throw new ValidationException("Yêu cầu 'status' và 'isPublished'.");
    }
    const product = await productService.updateProductStatus(
      req.params.id,
      status,
      isPublished
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái sản phẩm thành công.",
      data: product,
    });
  }
);

/**
 * Configure print methods for a product
 * @route PUT /api/admin/products/:id/print-methods
 */
export const handleConfigurePrintMethods = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    Logger.debug(
      `[ProductController] Configuring print methods for product: ${req.params.id}`
    );

    const { printMethods } = req.body;

    if (!printMethods || !Array.isArray(printMethods)) {
      throw new ValidationException(
        "printMethods phải là một array và không được để trống"
      );
    }

    const product = await printMethodService.configurePrintMethods(
      req.params.id,
      printMethods
    );

    Logger.success(
      `[ProductController] Configured print methods for product: ${product._id}`
    );

    res.status(200).json({
      success: true,
      message: "Đã cấu hình print methods thành công",
      data: { product },
    });
  }
);

/**
 * Set pricing tiers for a product
 * @route POST /api/admin/products/:id/pricing-tiers
 */
export const handleSetPricingTiers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    Logger.debug(
      `[ProductController] Setting pricing tiers for product: ${req.params.id}`
    );

    const { pricingTiers } = req.body;

    if (!pricingTiers || !Array.isArray(pricingTiers)) {
      throw new ValidationException(
        "pricingTiers phải là một array và không được để trống"
      );
    }

    const product = await pricingService.setPricingTiers(
      req.params.id,
      pricingTiers
    );

    Logger.success(
      `[ProductController] Set pricing tiers for product: ${product._id}`
    );

    res.status(200).json({
      success: true,
      message: "Đã thiết lập pricing tiers thành công",
      data: { product },
    });
  }
);

/**
 * Calculate price for a product with customization
 * @route POST /api/admin/products/:id/calculate-price
 */
export const handleCalculatePrice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    Logger.debug(
      `[ProductController] Calculating price for product: ${req.params.id}`
    );

    const { quantity, customization } = req.body;

    if (!quantity || quantity < 1) {
      throw new ValidationException("quantity phải lớn hơn 0");
    }

    const priceBreakdown = await pricingService.calculatePrice(
      req.params.id,
      quantity,
      customization
    );

    Logger.success(
      `[ProductController] Calculated price for product: ${req.params.id}, quantity: ${quantity}`
    );

    res.status(200).json({
      success: true,
      data: priceBreakdown,
    });
  }
);
