/**
 * PricingService - Dynamic Pricing Engine
 *
 * Business logic for calculating prices based on product specifications
 * Implements quantity tiers, finishing options, and margin validation
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { Parser } from "expr-eval";
import { Logger } from "../utils/logger.js";
import {
  PricingRepository,
  pricingRepository,
} from "../repositories/pricing.repository.js";
import {
  IPricingFormula,
  IQuantityTier,
} from "../models/pricing-formula.model.js";
import {
  ValidationException,
  NotFoundException,
} from "../shared/exceptions.js";

/**
 * Product specification for pricing calculation
 */
export interface ProductSpecification {
  productType: string;
  size: {
    width: number;
    height: number;
    unit: "mm" | "cm" | "inch";
  };
  paperType: string;
  quantity: number;
  finishingOptions: string[];
  printSides: "single" | "double";
  colors: number;
}

/**
 * Cost breakdown details
 */
export interface CostBreakdown {
  baseCost: number;
  paperCost: number;
  printingCost: number;
  finishingCost: number;
  finishingDetails: Record<string, number>;
  quantityDiscount: number;
  totalCost: number;
}

/**
 * Complete pricing result
 */
export interface PricingResult {
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  marginPercentage: number;
  breakdown: CostBreakdown;
  calculatedAt: Date;
  formulaId: string;
  formulaName: string;
  appliedTier?: IQuantityTier;
  marginWarning?: boolean;
  warningMessage?: string;
}

/**
 * Margin validation result
 */
export interface MarginValidation {
  isValid: boolean;
  actualMargin: number;
  minMargin: number;
  warning: boolean;
  message?: string;
}

/**
 * Formula inputs for evaluation
 */
export interface FormulaInputs {
  quantity: number;
  width: number;
  height: number;
  area: number;
  paperMultiplier: number;
  printSidesMultiplier: number;
  colorMultiplier: number;
  basePrice: number;
  finishingCost: number;
}

/**
 * PricingService - Dynamic Pricing Engine
 */
export class PricingService {
  private repository: PricingRepository;

  constructor(repository: PricingRepository = pricingRepository) {
    this.repository = repository;
  }

  /**
   * Calculate price for given product specifications
   * Requirements: 1.1 - Calculate and display cost price, selling price, and profit margin within 1 second
   *
   * @param specs - Product specifications
   * @returns Complete pricing result with breakdown
   */
  async calculatePrice(specs: ProductSpecification): Promise<PricingResult> {
    const startTime = Date.now();
    Logger.debug(`[PricingSvc] Calculating price for ${specs.productType}`);

    // Validate input
    this.validateSpecification(specs);

    // Find active formula for product type
    const formula = await this.repository.findActiveByProductType(
      specs.productType
    );
    if (!formula) {
      throw new NotFoundException("Pricing Formula", specs.productType);
    }

    // Calculate area in cm²
    const area = this.calculateArea(specs.size);

    // Get paper multiplier
    const paperMultiplier = this.getPaperMultiplier(formula, specs.paperType);

    // Get applicable quantity tier
    const tier = this.getApplicableTier(formula.quantityTiers, specs.quantity);

    // Calculate base price per unit from tier
    const basePrice = tier
      ? tier.pricePerUnit
      : this.getDefaultBasePrice(formula);

    // Calculate finishing costs
    const { totalFinishingCost, finishingDetails } =
      this.calculateFinishingCosts(formula, specs.finishingOptions);

    // Calculate print sides multiplier
    const printSidesMultiplier = specs.printSides === "double" ? 1.8 : 1.0;

    // Calculate color multiplier (more colors = higher cost)
    const colorMultiplier = 1 + (specs.colors - 1) * 0.1;

    // Build formula inputs
    const inputs: FormulaInputs = {
      quantity: specs.quantity,
      width: specs.size.width,
      height: specs.size.height,
      area,
      paperMultiplier,
      printSidesMultiplier,
      colorMultiplier,
      basePrice,
      finishingCost: totalFinishingCost,
    };

    // Evaluate formula to get cost price
    const costPrice = this.applyFormula(formula, inputs);

    // Calculate quantity discount
    const quantityDiscount = tier?.discount
      ? (costPrice * tier.discount) / 100
      : 0;

    // Calculate final cost price after discount
    const finalCostPrice = costPrice - quantityDiscount;

    // Calculate selling price (cost + margin)
    const marginMultiplier = 1 + formula.minMargin / 100;
    const sellingPrice = Math.ceil(finalCostPrice * marginMultiplier);

    // Calculate actual profit margin
    const profitMargin = sellingPrice - finalCostPrice;
    const marginPercentage = (profitMargin / finalCostPrice) * 100;

    // Check margin warning
    const marginValidation = this.validateMargin(
      {
        costPrice: finalCostPrice,
        sellingPrice,
        profitMargin,
        marginPercentage,
      } as any,
      formula.minMargin
    );

    // Build cost breakdown
    const breakdown: CostBreakdown = {
      baseCost: basePrice * specs.quantity,
      paperCost: basePrice * specs.quantity * (paperMultiplier - 1),
      printingCost:
        basePrice *
        specs.quantity *
        (printSidesMultiplier - 1) *
        colorMultiplier,
      finishingCost: totalFinishingCost * specs.quantity,
      finishingDetails,
      quantityDiscount,
      totalCost: finalCostPrice,
    };

    const result: PricingResult = {
      costPrice: finalCostPrice,
      sellingPrice,
      profitMargin,
      marginPercentage: Math.round(marginPercentage * 100) / 100,
      breakdown,
      calculatedAt: new Date(),
      formulaId: formula._id.toString(),
      formulaName: formula.name,
      appliedTier: tier || undefined,
      marginWarning: marginValidation.warning,
      warningMessage: marginValidation.message,
    };

    const elapsed = Date.now() - startTime;
    Logger.debug(`[PricingSvc] Price calculated in ${elapsed}ms`);

    return result;
  }

  /**
   * Validate product specification
   */
  private validateSpecification(specs: ProductSpecification): void {
    if (!specs.productType || specs.productType.trim().length === 0) {
      throw new ValidationException("Loại sản phẩm không được để trống");
    }

    if (!specs.size || specs.size.width <= 0 || specs.size.height <= 0) {
      throw new ValidationException("Kích thước sản phẩm không hợp lệ");
    }

    if (!specs.quantity || specs.quantity < 1) {
      throw new ValidationException("Số lượng phải lớn hơn 0");
    }

    if (!specs.paperType || specs.paperType.trim().length === 0) {
      throw new ValidationException("Loại giấy không được để trống");
    }

    if (!specs.printSides || !["single", "double"].includes(specs.printSides)) {
      throw new ValidationException("Kiểu in phải là 'single' hoặc 'double'");
    }

    if (!specs.colors || specs.colors < 1) {
      throw new ValidationException("Số màu phải lớn hơn 0");
    }
  }

  /**
   * Calculate area in cm² from size specification
   */
  private calculateArea(size: ProductSpecification["size"]): number {
    let width = size.width;
    let height = size.height;

    // Convert to cm
    switch (size.unit) {
      case "mm":
        width /= 10;
        height /= 10;
        break;
      case "inch":
        width *= 2.54;
        height *= 2.54;
        break;
      // cm is default, no conversion needed
    }

    return width * height;
  }

  /**
   * Get paper multiplier from formula
   */
  private getPaperMultiplier(
    formula: IPricingFormula,
    paperType: string
  ): number {
    const multipliers = formula.paperMultipliers;
    if (multipliers instanceof Map) {
      return multipliers.get(paperType) || 1.0;
    }
    // Handle plain object (from lean())
    return (multipliers as any)?.[paperType] || 1.0;
  }

  /**
   * Get applicable quantity tier based on quantity
   * Requirements: 1.2 - Apply correct tier based on quantity input
   */
  getApplicableTier(
    tiers: IQuantityTier[],
    quantity: number
  ): IQuantityTier | null {
    if (!tiers || tiers.length === 0) {
      return null;
    }

    // Sort tiers by minQuantity ascending
    const sortedTiers = [...tiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );

    // Find the tier that matches the quantity
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQuantity && quantity <= tier.maxQuantity) {
        return tier;
      }
    }

    // If quantity exceeds all tiers, return the highest tier
    const highestTier = sortedTiers[sortedTiers.length - 1];
    if (quantity > highestTier.maxQuantity) {
      return highestTier;
    }

    return null;
  }

  /**
   * Get default base price when no tier matches
   */
  private getDefaultBasePrice(formula: IPricingFormula): number {
    // Use the first tier's price or a default value
    if (formula.quantityTiers && formula.quantityTiers.length > 0) {
      return formula.quantityTiers[0].pricePerUnit;
    }
    return 1000; // Default base price in VND
  }

  /**
   * Calculate finishing costs
   * Requirements: 1.3 - Sum base cost with all selected finishing option costs
   */
  calculateFinishingCosts(
    formula: IPricingFormula,
    finishingOptions: string[]
  ): { totalFinishingCost: number; finishingDetails: Record<string, number> } {
    const finishingDetails: Record<string, number> = {};
    let totalFinishingCost = 0;

    if (!finishingOptions || finishingOptions.length === 0) {
      return { totalFinishingCost: 0, finishingDetails: {} };
    }

    const costs = formula.finishingCosts;

    for (const option of finishingOptions) {
      let cost = 0;
      if (costs instanceof Map) {
        cost = costs.get(option) || 0;
      } else {
        // Handle plain object (from lean())
        cost = (costs as any)?.[option] || 0;
      }
      finishingDetails[option] = cost;
      totalFinishingCost += cost;
    }

    return { totalFinishingCost, finishingDetails };
  }

  /**
   * Apply pricing formula with given inputs
   * Requirements: 1.4 - Apply formula consistently across all calculations
   *
   * Formula is deterministic - same inputs always produce same outputs
   */
  applyFormula(formula: IPricingFormula, inputs: FormulaInputs): number {
    // Parse and evaluate the formula string
    // Formula example: "basePrice * quantity * paperMultiplier + finishingCost * quantity"
    const formulaStr = formula.formula;

    // Validate formula BEFORE attempting evaluation
    // This will throw if formula contains dangerous patterns
    this.validateFormulaString(formulaStr);

    try {
      // Create a safe evaluation context with only the allowed variables
      const context: Record<string, number> = {
        quantity: inputs.quantity,
        width: inputs.width,
        height: inputs.height,
        area: inputs.area,
        paperMultiplier: inputs.paperMultiplier,
        printSidesMultiplier: inputs.printSidesMultiplier,
        colorMultiplier: inputs.colorMultiplier,
        basePrice: inputs.basePrice,
        finishingCost: inputs.finishingCost,
      };

      // Evaluate formula using safe parser
      const result = this.evaluateFormula(formulaStr, context);

      // Ensure result is a valid number
      if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
        throw new Error("Formula evaluation resulted in invalid number");
      }

      return Math.ceil(result); // Round up to nearest integer
    } catch (error) {
      Logger.error(`[PricingSvc] Error evaluating formula:`, error);
      // Re-throw the error instead of falling back
      // This ensures security validation errors are not silently ignored
      throw error;
    }
  }

  /**
   * Evaluate formula string with given context
   * Deterministic: same inputs always produce same outputs
   *
   * SECURITY: Uses expr-eval library for safe expression evaluation
   * - No eval() or Function constructor
   * - Strict whitelist of allowed operators: +, -, *, /, (, )
   * - No access to global scope or dangerous functions
   *
   * Note: Formula validation should be done before calling this method
   */
  private evaluateFormula(
    formulaStr: string,
    context: Record<string, number>
  ): number {
    // Create a safe parser instance
    const parser = new Parser();

    // Parse the formula expression
    const expr = parser.parse(formulaStr);

    // Evaluate with the provided context
    // expr-eval only allows mathematical operations, no code execution
    const result = expr.evaluate(context);

    return result;
  }

  /**
   * Validate formula string for security
   * - Check for dangerous patterns
   * - Ensure only allowed operators
   * - Prevent code injection attempts
   */
  private validateFormulaString(formulaStr: string): void {
    if (!formulaStr || typeof formulaStr !== "string") {
      throw new Error("Formula must be a non-empty string");
    }

    // Trim whitespace
    const formula = formulaStr.trim();

    if (formula.length === 0) {
      throw new Error("Formula cannot be empty");
    }

    // Check for dangerous patterns that should never appear in a math formula
    const dangerousPatterns = [
      /eval/i,
      /function/i,
      /constructor/i,
      /prototype/i,
      /__proto__/i,
      /import/i,
      /require/i,
      /process/i,
      /global/i,
      /window/i,
      /document/i,
      /\$\{/, // Template literals
      /`/, // Backticks
      /;/, // Statement separator
      /=/, // Assignment (except in comparison ==)
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(formula)) {
        throw new Error(
          `Formula contains forbidden pattern: ${pattern.source}`
        );
      }
    }

    // Whitelist: Only allow mathematical operators, numbers, variables, and parentheses
    // Allowed: +, -, *, /, (, ), numbers, letters (for variables), dots, underscores
    const allowedPattern = /^[a-zA-Z0-9_+\-*/().\s]+$/;
    if (!allowedPattern.test(formula)) {
      throw new Error(
        "Formula contains invalid characters. Only mathematical operators (+, -, *, /, parentheses) and alphanumeric variable names are allowed"
      );
    }

    Logger.debug(`[PricingSvc] Formula validation passed: ${formula}`);
  }

  /**
   * Fallback calculation when formula evaluation fails
   */
  private fallbackCalculation(inputs: FormulaInputs): number {
    const baseCost = inputs.basePrice * inputs.quantity;
    const paperCost = baseCost * inputs.paperMultiplier;
    const printCost =
      paperCost * inputs.printSidesMultiplier * inputs.colorMultiplier;
    const finishingCost = inputs.finishingCost * inputs.quantity;

    return Math.ceil(printCost + finishingCost);
  }

  /**
   * Validate margin against minimum threshold
   * Requirements: 1.5 - Display warning when margin falls below minimum
   */
  validateMargin(pricing: PricingResult, minMargin: number): MarginValidation {
    const actualMargin = pricing.marginPercentage;
    const isValid = actualMargin >= minMargin;
    const warning = !isValid;

    return {
      isValid,
      actualMargin,
      minMargin,
      warning,
      message: warning
        ? `Lợi nhuận ${actualMargin.toFixed(
            2
          )}% thấp hơn mức tối thiểu ${minMargin}%`
        : undefined,
    };
  }

  /**
   * Get all quantity tiers for a product type
   */
  async getQuantityTiers(productType: string): Promise<IQuantityTier[]> {
    const formula = await this.repository.findActiveByProductType(productType);
    if (!formula) {
      return [];
    }
    return formula.quantityTiers || [];
  }

  /**
   * Get all active pricing formulas
   */
  async getActiveFormulas(): Promise<IPricingFormula[]> {
    return this.repository.findActiveFormulas();
  }

  /**
   * Get pricing formula by ID
   */
  async getFormulaById(id: string): Promise<IPricingFormula | null> {
    return this.repository.findById(id);
  }

  /**
   * Update pricing formula
   */
  async updateFormula(
    id: string,
    data: Partial<IPricingFormula>
  ): Promise<IPricingFormula | null> {
    return this.repository.update(id, data);
  }

  /**
   * Create new pricing formula
   */
  async createFormula(
    data: Partial<IPricingFormula>
  ): Promise<IPricingFormula> {
    return this.repository.create(data);
  }
}

// Export singleton instance
export const pricingService = new PricingService();
