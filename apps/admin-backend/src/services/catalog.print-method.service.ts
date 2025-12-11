// apps/admin-backend/src/services/catalog.print-method.service.ts
// ✅ Print Method Configuration Service
// Phase 3.1.1: Implement Print Method Configuration

import { Types } from "mongoose";
import { CatalogProduct } from "../models/catalog.models.js";
import {
  IPrintMethod,
  IMoqByPrintMethod,
  IProductionComplexity,
  calculateCustomizationCost,
  validateArtworkForPrintMethod,
  getMoqForPrintMethod,
  estimateLeadTime,
  DEFAULT_PRINT_METHODS,
  PRINT_METHODS,
} from "../models/catalog.models.enhanced.js";
import {
  ValidationException,
  NotFoundException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Service for managing print methods and customization configuration
 */
export class PrintMethodService {
  /**
   * Configure print methods for a product
   */
  async configurePrintMethods(
    productId: string,
    printMethods: IPrintMethod[]
  ): Promise<any> {
    Logger.debug(
      `[PrintMethodSvc] Configuring print methods for product: ${productId}`
    );

    // Validate product exists
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // Validate print methods
    this.validatePrintMethods(printMethods);

    // Update product
    product.set("printMethods", printMethods);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Configured ${printMethods.length} print methods for product: ${product.name}`
    );

    return product;
  }

  /**
   * Add a single print method to a product
   */
  async addPrintMethod(
    productId: string,
    printMethod: IPrintMethod
  ): Promise<any> {
    Logger.debug(
      `[PrintMethodSvc] Adding print method ${printMethod.method} to product: ${productId}`
    );

    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // Validate print method
    this.validatePrintMethod(printMethod);

    // Check if method already exists
    const existingMethods =
      (product.get("printMethods") as IPrintMethod[]) || [];
    const existingIndex = existingMethods.findIndex(
      (m) => m.method === printMethod.method
    );

    if (existingIndex >= 0) {
      // Update existing
      existingMethods[existingIndex] = printMethod;
    } else {
      // Add new
      existingMethods.push(printMethod);
    }

    product.set("printMethods", existingMethods);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Added print method ${printMethod.method} to product: ${product.name}`
    );

    return product;
  }

  /**
   * Remove a print method from a product
   */
  async removePrintMethod(
    productId: string,
    printMethodName: string
  ): Promise<any> {
    Logger.debug(
      `[PrintMethodSvc] Removing print method ${printMethodName} from product: ${productId}`
    );

    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    const existingMethods =
      (product.get("printMethods") as IPrintMethod[]) || [];
    const filteredMethods = existingMethods.filter(
      (m) => m.method !== printMethodName
    );

    if (filteredMethods.length === existingMethods.length) {
      throw new NotFoundException("Print Method", printMethodName);
    }

    product.set("printMethods", filteredMethods);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Removed print method ${printMethodName} from product: ${product.name}`
    );

    return product;
  }

  /**
   * Configure MOQ (Minimum Order Quantity) per print method
   */
  async configureMoqByPrintMethod(
    productId: string,
    moqConfig: IMoqByPrintMethod[]
  ): Promise<any> {
    Logger.debug(`[PrintMethodSvc] Configuring MOQ for product: ${productId}`);

    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // Validate MOQ configuration
    moqConfig.forEach((config) => {
      if (config.moq < 1) {
        throw new ValidationException(
          `MOQ must be at least 1 for print method: ${config.printMethod}`
        );
      }
    });

    product.set("moqByPrintMethod", moqConfig);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Configured MOQ for ${moqConfig.length} print methods`
    );

    return product;
  }

  /**
   * Set production complexity for a product
   */
  async setProductionComplexity(
    productId: string,
    complexity: IProductionComplexity
  ): Promise<any> {
    Logger.debug(
      `[PrintMethodSvc] Setting production complexity for product: ${productId}`
    );

    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // Validate complexity
    if (complexity.score < 1 || complexity.score > 10) {
      throw new ValidationException(
        "Complexity score must be between 1 and 10"
      );
    }

    if (complexity.estimatedLeadTimeDays < 1) {
      throw new ValidationException(
        "Estimated lead time must be at least 1 day"
      );
    }

    product.set("productionComplexity", complexity);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Set production complexity score ${complexity.score} for product: ${product.name}`
    );

    return product;
  }

  /**
   * Calculate customization cost for a configuration
   */
  calculateCustomizationCost(
    printMethod: IPrintMethod,
    selectedAreas: string[],
    quantity: number
  ): {
    setupFees: number;
    unitCosts: number;
    totalCost: number;
    breakdown: Array<{
      area: string;
      setupFee: number;
      unitCost: number;
      totalCost: number;
    }>;
  } {
    const breakdown: Array<{
      area: string;
      setupFee: number;
      unitCost: number;
      totalCost: number;
    }> = [];

    let totalSetupFees = 0;
    let totalUnitCosts = 0;

    selectedAreas.forEach((areaName) => {
      const area = printMethod.areas.find((a) => a.name === areaName);
      if (area) {
        const setupFee = area.setupFee;
        const unitCost = area.unitCost * quantity;
        const totalCost = setupFee + unitCost;

        breakdown.push({
          area: areaName,
          setupFee,
          unitCost,
          totalCost,
        });

        totalSetupFees += setupFee;
        totalUnitCosts += unitCost;
      }
    });

    return {
      setupFees: totalSetupFees,
      unitCosts: totalUnitCosts,
      totalCost: totalSetupFees + totalUnitCosts,
      breakdown,
    };
  }

  /**
   * Validate artwork against print method requirements
   */
  validateArtwork(
    artwork: {
      resolution: number;
      format: string;
      fileSize: number;
      colorMode: string;
      hasTransparency: boolean;
      isVector: boolean;
    },
    printMethod: IPrintMethod
  ): {
    isValid: boolean;
    errors: string[];
  } {
    return validateArtworkForPrintMethod(
      artwork,
      printMethod.artworkRequirements
    );
  }

  /**
   * Get MOQ for a specific print method
   */
  async getMoqForPrintMethod(
    productId: string,
    printMethodName: string
  ): Promise<number> {
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    const moqConfig =
      (product.get("moqByPrintMethod") as IMoqByPrintMethod[]) || [];
    const config = moqConfig.find((m) => m.printMethod === printMethodName);

    return config?.moq || 1;
  }

  /**
   * Estimate lead time for a print configuration
   */
  async estimateLeadTime(
    productId: string,
    printMethodName: string,
    quantity: number
  ): Promise<{
    minDays: number;
    maxDays: number;
    notes: string[];
  }> {
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    const printMethods = (product.get("printMethods") as IPrintMethod[]) || [];
    const printMethod = printMethods.find((m) => m.method === printMethodName);

    if (!printMethod) {
      throw new NotFoundException("Print Method", printMethodName);
    }

    const complexity = product.get(
      "productionComplexity"
    ) as IProductionComplexity;

    const baseMin = printMethod.leadTime.min;
    const baseMax = printMethod.leadTime.max;

    // Adjust based on complexity
    const complexityMultiplier = complexity ? complexity.score / 5 : 1;

    // Adjust based on quantity
    const quantityMultiplier = quantity > 100 ? 1.5 : quantity > 50 ? 1.2 : 1;

    const notes: string[] = [];
    if (complexity && complexity.score > 7) {
      notes.push("High complexity product may require additional time");
    }
    if (quantity > 100) {
      notes.push("Large quantity order may require additional production time");
    }

    return {
      minDays: Math.ceil(baseMin * complexityMultiplier * quantityMultiplier),
      maxDays: Math.ceil(baseMax * complexityMultiplier * quantityMultiplier),
      notes,
    };
  }

  /**
   * Get available print methods for a product
   */
  async getAvailablePrintMethods(productId: string): Promise<IPrintMethod[]> {
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    const printMethods = (product.get("printMethods") as IPrintMethod[]) || [];
    return printMethods.filter((m) => m.isActive);
  }

  /**
   * Apply default print method configuration to a product
   */
  async applyDefaultPrintMethod(
    productId: string,
    templateName: keyof typeof DEFAULT_PRINT_METHODS
  ): Promise<any> {
    Logger.debug(
      `[PrintMethodSvc] Applying default print method ${templateName} to product: ${productId}`
    );

    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    const template = DEFAULT_PRINT_METHODS[templateName];
    if (!template) {
      throw new ValidationException(`Unknown template: ${templateName}`);
    }

    const existingMethods =
      (product.get("printMethods") as IPrintMethod[]) || [];
    existingMethods.push(template);

    product.set("printMethods", existingMethods);
    await product.save();

    Logger.success(
      `[PrintMethodSvc] Applied default print method ${templateName} to product: ${product.name}`
    );

    return product;
  }

  // ============================================
  // PRIVATE VALIDATION METHODS
  // ============================================

  private validatePrintMethods(printMethods: IPrintMethod[]): void {
    if (!printMethods || printMethods.length === 0) {
      throw new ValidationException("At least one print method is required");
    }

    printMethods.forEach((method) => {
      this.validatePrintMethod(method);
    });
  }

  private validatePrintMethod(printMethod: IPrintMethod): void {
    if (!printMethod.method) {
      throw new ValidationException("Print method name is required");
    }

    if (!printMethod.displayName) {
      throw new ValidationException("Print method display name is required");
    }

    if (!printMethod.areas || printMethod.areas.length === 0) {
      throw new ValidationException(
        `At least one print area is required for method: ${printMethod.method}`
      );
    }

    // Validate each area
    printMethod.areas.forEach((area) => {
      if (!area.name || !area.displayName) {
        throw new ValidationException(
          "Area name and display name are required"
        );
      }

      if (area.maxWidth <= 0 || area.maxHeight <= 0) {
        throw new ValidationException(
          `Invalid dimensions for area: ${area.name}`
        );
      }

      if (area.allowedColors < 1) {
        throw new ValidationException(
          `Allowed colors must be at least 1 for area: ${area.name}`
        );
      }
    });

    // Validate artwork requirements
    if (!printMethod.artworkRequirements) {
      throw new ValidationException(
        `Artwork requirements are required for method: ${printMethod.method}`
      );
    }

    const req = printMethod.artworkRequirements;
    if (req.minResolution < 72) {
      throw new ValidationException(
        "Minimum resolution must be at least 72 DPI"
      );
    }

    if (!req.acceptedFormats || req.acceptedFormats.length === 0) {
      throw new ValidationException("At least one accepted format is required");
    }

    if (req.maxFileSize <= 0) {
      throw new ValidationException("Max file size must be greater than 0");
    }
  }
}

export default new PrintMethodService();
