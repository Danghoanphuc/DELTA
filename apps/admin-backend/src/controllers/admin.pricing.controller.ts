/**
 * PricingController - API endpoints for Dynamic Pricing Engine
 *
 * Handles HTTP requests for pricing calculations and formula management
 * Following the existing controller patterns in the codebase
 *
 * Requirements: 1.1, 1.4
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Logger } from "../utils/logger.js";
import {
  PricingService,
  pricingService,
  ProductSpecification,
} from "../services/pricing.service.js";
import {
  ValidationException,
  NotFoundException,
} from "../shared/exceptions.js";

// Helper to get admin ID from request
const getAdminId = (req: Request): string => {
  return req.admin?._id?.toString() || "";
};

/**
 * PricingController - Handles pricing-related API endpoints
 */
export class PricingController {
  private service: PricingService;

  constructor(service: PricingService = pricingService) {
    this.service = service;
  }

  /**
   * Calculate price for given product specifications
   * @route POST /api/admin/pricing/calculate
   * Requirements: 1.1
   */
  calculatePrice = asyncHandler(async (req: Request, res: Response) => {
    Logger.debug(`[PricingCtrl] Calculate price request`);

    const specs = this.validateAndExtractSpecs(req.body);
    const result = await this.service.calculatePrice(specs);

    res.json({
      success: true,
      data: { pricing: result },
      message: "Đã tính giá thành công",
    });
  });

  /**
   * Get all available pricing formulas
   * @route GET /api/admin/pricing/formulas
   * Requirements: 1.4
   */
  getFormulas = asyncHandler(async (req: Request, res: Response) => {
    Logger.debug(`[PricingCtrl] Get formulas request`);

    const formulas = await this.service.getActiveFormulas();

    res.json({
      success: true,
      data: { formulas },
    });
  });

  /**
   * Get single pricing formula by ID
   * @route GET /api/admin/pricing/formulas/:id
   * Requirements: 1.4
   */
  getFormula = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    Logger.debug(`[PricingCtrl] Get formula ${id}`);

    const formula = await this.service.getFormulaById(id);
    if (!formula) {
      throw new NotFoundException("Pricing Formula", id);
    }

    res.json({
      success: true,
      data: { formula },
    });
  });

  /**
   * Update pricing formula (Admin only)
   * @route PUT /api/admin/pricing/formulas/:id
   * Requirements: 1.4
   */
  updateFormula = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = getAdminId(req);
    Logger.debug(`[PricingCtrl] Update formula ${id} by admin ${adminId}`);

    // Validate update data
    const updateData = this.validateFormulaUpdate(req.body);

    const formula = await this.service.updateFormula(id, updateData);
    if (!formula) {
      throw new NotFoundException("Pricing Formula", id);
    }

    Logger.success(`[PricingCtrl] Formula ${id} updated by admin ${adminId}`);

    res.json({
      success: true,
      data: { formula },
      message: "Đã cập nhật công thức giá",
    });
  });

  /**
   * Create new pricing formula (Admin only)
   * @route POST /api/admin/pricing/formulas
   * Requirements: 1.4
   */
  createFormula = asyncHandler(async (req: Request, res: Response) => {
    const adminId = getAdminId(req);
    Logger.debug(`[PricingCtrl] Create formula by admin ${adminId}`);

    // Validate formula data
    const formulaData = this.validateFormulaCreate(req.body);
    formulaData.createdBy = adminId;

    const formula = await this.service.createFormula(formulaData);

    Logger.success(`[PricingCtrl] Formula created: ${formula.name}`);

    res.status(201).json({
      success: true,
      data: { formula },
      message: "Đã tạo công thức giá mới",
    });
  });

  /**
   * Get quantity tiers for a product type
   * @route GET /api/admin/pricing/tiers/:productType
   * Requirements: 1.2
   */
  getQuantityTiers = asyncHandler(async (req: Request, res: Response) => {
    const { productType } = req.params;
    Logger.debug(`[PricingCtrl] Get tiers for ${productType}`);

    const tiers = await this.service.getQuantityTiers(productType);

    res.json({
      success: true,
      data: { tiers, productType },
    });
  });

  /**
   * Validate and extract product specifications from request body
   */
  private validateAndExtractSpecs(body: any): ProductSpecification {
    const {
      productType,
      size,
      paperType,
      quantity,
      finishingOptions,
      printSides,
      colors,
    } = body;

    if (!productType || typeof productType !== "string") {
      throw new ValidationException("Loại sản phẩm không hợp lệ");
    }

    if (
      !size ||
      typeof size.width !== "number" ||
      typeof size.height !== "number"
    ) {
      throw new ValidationException("Kích thước sản phẩm không hợp lệ");
    }

    if (!["mm", "cm", "inch"].includes(size.unit)) {
      throw new ValidationException(
        "Đơn vị kích thước phải là mm, cm hoặc inch"
      );
    }

    if (!paperType || typeof paperType !== "string") {
      throw new ValidationException("Loại giấy không hợp lệ");
    }

    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      throw new ValidationException("Số lượng phải là số nguyên dương");
    }

    if (!["single", "double"].includes(printSides)) {
      throw new ValidationException("Kiểu in phải là single hoặc double");
    }

    if (!colors || typeof colors !== "number" || colors < 1) {
      throw new ValidationException("Số màu phải là số nguyên dương");
    }

    return {
      productType,
      size: {
        width: size.width,
        height: size.height,
        unit: size.unit,
      },
      paperType,
      quantity,
      finishingOptions: Array.isArray(finishingOptions) ? finishingOptions : [],
      printSides,
      colors,
    };
  }

  /**
   * Validate formula update data
   */
  private validateFormulaUpdate(body: any): any {
    const allowedFields = [
      "name",
      "formula",
      "variables",
      "quantityTiers",
      "paperMultipliers",
      "finishingCosts",
      "minMargin",
      "isActive",
    ];

    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate minMargin if provided
    if (updateData.minMargin !== undefined) {
      if (
        typeof updateData.minMargin !== "number" ||
        updateData.minMargin < 0 ||
        updateData.minMargin > 100
      ) {
        throw new ValidationException("Lợi nhuận tối thiểu phải từ 0 đến 100%");
      }
    }

    return updateData;
  }

  /**
   * Validate formula create data
   */
  private validateFormulaCreate(body: any): any {
    const { name, productType, formula, minMargin } = body;

    if (!name || typeof name !== "string") {
      throw new ValidationException("Tên công thức không hợp lệ");
    }

    if (!productType || typeof productType !== "string") {
      throw new ValidationException("Loại sản phẩm không hợp lệ");
    }

    if (!formula || typeof formula !== "string") {
      throw new ValidationException("Công thức tính giá không hợp lệ");
    }

    if (
      minMargin !== undefined &&
      (typeof minMargin !== "number" || minMargin < 0 || minMargin > 100)
    ) {
      throw new ValidationException("Lợi nhuận tối thiểu phải từ 0 đến 100%");
    }

    return {
      name,
      productType,
      formula,
      variables: body.variables || [],
      quantityTiers: body.quantityTiers || [],
      paperMultipliers: body.paperMultipliers || {},
      finishingCosts: body.finishingCosts || {},
      minMargin: minMargin || 10,
      isActive: body.isActive !== false,
    };
  }
}

// Export singleton instance
export const pricingController = new PricingController();
