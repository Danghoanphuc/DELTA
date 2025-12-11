// apps/admin-backend/src/services/catalog.pricing.service.ts
// ✅ Dynamic Pricing Service
// Phase 3.1.2: Volume-based pricing, automatic discounts, price calculator

import { Types } from "mongoose";
import { CatalogProduct } from "../models/catalog.models.js";
import {
  IPrintMethod,
  calculateCustomizationCost,
} from "../models/catalog.models.enhanced.js";
import {
  ValidationException,
  NotFoundException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Pricing Tier Interface
 */
export interface IPricingTier {
  minQty: number;
  maxQty?: number; // undefined = infinity
  pricePerUnit: number;
  discount?: number; // percentage
}

/**
 * Price Calculation Result
 */
export interface IPriceCalculation {
  // Base Pricing
  basePrice: number;
  quantity: number;
  appliedTier: IPricingTier | null;
  unitPrice: number; // after volume discount
  subtotal: number;

  // Customization
  customization?: {
    setupFees: number;
    unitCosts: number;
    totalCost: number;
    breakdown: Array<{
      area: string;
      setupFee: number;
      unitCost: number;
      totalCost: number;
    }>;
  };

  // Discounts
  volumeDiscount: {
    percentage: number;
    amount: number;
  };

  // Totals
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalPrice: number;

  // Savings
  savingsVsBasePrice: number;
  savingsPercentage: number;

  // Next Tier Info (for upsell)
  nextTier?: {
    minQty: number;
    pricePerUnit: number;
    potentialSavings: number;
  };
}

/**
 * Customization Options for Price Calculation
 */
export interface ICustomizationOptions {
  printMethod: string;
  printAreas: string[];
}

/**
 * Dynamic Pricing Service
 * Handles volume-based pricing, discounts, and price calculations
 */
export class PricingService {
  /**
   * Calculate price for a product with volume tiers and customization
   * @param productId - Product ID
   * @param variantId - SKU Variant ID (optional)
   * @param quantity - Order quantity
   * @param customization - Customization options (optional)
   * @returns Complete price calculation breakdown
   */
  async calculatePrice(
    productId: string,
    variantId: string | null,
    quantity: number,
    customization?: ICustomizationOptions
  ): Promise<IPriceCalculation> {
    Logger.debug(
      `[PricingSvc] Calculating price for product ${productId}, qty: ${quantity}`
    );

    // 1. Get product
    const product = await CatalogProduct.findById(productId).lean();
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // 2. Get base price (from variant or product)
    let basePrice = product.basePrice || 0;
    if (variantId) {
      const variant = await this.getVariantPrice(variantId);
      basePrice = variant;
    }

    // 3. Validate quantity
    if (quantity < 1) {
      throw new ValidationException("Số lượng phải lớn hơn 0");
    }

    // 4. Apply volume discount
    const appliedTier = this.findApplicableTier(
      product.pricingTiers || [],
      quantity
    );
    const unitPrice = appliedTier ? appliedTier.pricePerUnit : basePrice;

    const subtotal = unitPrice * quantity;

    // 5. Calculate volume discount
    const volumeDiscount = {
      percentage: appliedTier?.discount || 0,
      amount: appliedTier ? (basePrice - unitPrice) * quantity : 0,
    };

    // 6. Calculate customization costs
    let customizationCost;
    if (customization) {
      customizationCost = await this.calculateCustomizationCost(
        product,
        customization,
        quantity
      );
    }

    // 7. Calculate totals
    const totalBeforeDiscount = basePrice * quantity;
    const totalDiscount = volumeDiscount.amount;
    const totalPrice = subtotal + (customizationCost?.totalCost || 0);

    // 8. Calculate savings
    const savingsVsBasePrice = totalBeforeDiscount - totalPrice;
    const savingsPercentage =
      totalBeforeDiscount > 0
        ? (savingsVsBasePrice / totalBeforeDiscount) * 100
        : 0;

    // 9. Find next tier for upsell
    const nextTier = this.findNextTier(product.pricingTiers || [], quantity);

    const result: IPriceCalculation = {
      basePrice,
      quantity,
      appliedTier,
      unitPrice,
      subtotal,
      customization: customizationCost,
      volumeDiscount,
      totalBeforeDiscount,
      totalDiscount,
      totalPrice,
      savingsVsBasePrice,
      savingsPercentage,
      nextTier,
    };

    Logger.success(
      `[PricingSvc] Price calculated: ${totalPrice.toLocaleString()} VND`
    );

    return result;
  }

  /**
   * Get variant price
   */
  private async getVariantPrice(variantId: string): Promise<number> {
    // TODO: Implement when SKU Variant model is ready
    // For now, return 0
    return 0;
  }

  /**
   * Find applicable pricing tier for quantity
   */
  private findApplicableTier(
    tiers: IPricingTier[],
    quantity: number
  ): IPricingTier | null {
    if (!tiers || tiers.length === 0) return null;

    // Sort tiers by minQty descending
    const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty);

    // Find first tier where quantity >= minQty
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        // Check maxQty if defined
        if (tier.maxQty === undefined || quantity <= tier.maxQty) {
          return tier;
        }
      }
    }

    return null;
  }

  /**
   * Find next tier for upsell suggestion
   */
  private findNextTier(
    tiers: IPricingTier[],
    currentQuantity: number
  ): IPriceCalculation["nextTier"] | undefined {
    if (!tiers || tiers.length === 0) return undefined;

    // Sort tiers by minQty ascending
    const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

    // Find first tier where minQty > currentQuantity
    const nextTier = sortedTiers.find((t) => t.minQty > currentQuantity);

    if (!nextTier) return undefined;

    const currentTier = this.findApplicableTier(tiers, currentQuantity);
    const currentUnitPrice = currentTier?.pricePerUnit || 0;

    const potentialSavings =
      (currentUnitPrice - nextTier.pricePerUnit) * nextTier.minQty;

    return {
      minQty: nextTier.minQty,
      pricePerUnit: nextTier.pricePerUnit,
      potentialSavings,
    };
  }

  /**
   * Calculate customization costs
   */
  private async calculateCustomizationCost(
    product: any,
    customization: ICustomizationOptions,
    quantity: number
  ): Promise<IPriceCalculation["customization"]> {
    const { printMethod, printAreas } = customization;

    // Find print method configuration
    const methodConfig = product.printMethods?.find(
      (m: IPrintMethod) => m.method === printMethod
    );

    if (!methodConfig) {
      throw new ValidationException(
        `Print method ${printMethod} không khả dụng cho sản phẩm này`
      );
    }

    // Calculate costs using helper function
    const costs = calculateCustomizationCost(
      methodConfig,
      printAreas,
      quantity
    );

    // Build breakdown
    const breakdown = printAreas.map((areaName) => {
      const area = methodConfig.areas.find((a) => a.name === areaName);
      return {
        area: areaName,
        setupFee: area?.setupFee || 0,
        unitCost: area?.unitCost || 0,
        totalCost: (area?.setupFee || 0) + (area?.unitCost || 0) * quantity,
      };
    });

    return {
      setupFees: costs.setupFees,
      unitCosts: costs.unitCosts,
      totalCost: costs.totalCost,
      breakdown,
    };
  }

  /**
   * Apply volume discount to base price
   * @param basePrice - Base price per unit
   * @param quantity - Order quantity
   * @param tiers - Pricing tiers
   * @returns Discounted price per unit
   */
  applyVolumeDiscount(
    basePrice: number,
    quantity: number,
    tiers: IPricingTier[]
  ): number {
    const tier = this.findApplicableTier(tiers, quantity);
    return tier ? tier.pricePerUnit : basePrice;
  }

  /**
   * Validate pricing tiers configuration
   * Ensures tiers don't overlap and are properly ordered
   */
  validatePricingTiers(tiers: IPricingTier[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!tiers || tiers.length === 0) {
      return { isValid: true, errors: [] };
    }

    // Sort by minQty
    const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];

      // Validate minQty
      if (tier.minQty < 1) {
        errors.push(`Tier ${i + 1}: minQty phải >= 1`);
      }

      // Validate maxQty
      if (tier.maxQty !== undefined && tier.maxQty < tier.minQty) {
        errors.push(`Tier ${i + 1}: maxQty phải >= minQty`);
      }

      // Validate pricePerUnit
      if (tier.pricePerUnit <= 0) {
        errors.push(`Tier ${i + 1}: pricePerUnit phải > 0`);
      }

      // Check for gaps/overlaps with next tier
      if (i < sortedTiers.length - 1) {
        const nextTier = sortedTiers[i + 1];

        if (tier.maxQty !== undefined) {
          if (tier.maxQty >= nextTier.minQty) {
            errors.push(
              `Tier ${i + 1} và ${i + 2}: Có overlap (${tier.maxQty} >= ${
                nextTier.minQty
              })`
            );
          }

          if (tier.maxQty + 1 < nextTier.minQty) {
            errors.push(
              `Tier ${i + 1} và ${i + 2}: Có gap (${tier.maxQty} -> ${
                nextTier.minQty
              })`
            );
          }
        }
      }

      // Validate discount percentage
      if (tier.discount !== undefined) {
        if (tier.discount < 0 || tier.discount > 100) {
          errors.push(`Tier ${i + 1}: discount phải từ 0-100%`);
        }
      }

      // Validate price decreases with quantity
      if (i > 0) {
        const prevTier = sortedTiers[i - 1];
        if (tier.pricePerUnit >= prevTier.pricePerUnit) {
          errors.push(`Tier ${i + 1}: pricePerUnit phải nhỏ hơn tier trước đó`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate margin for a price calculation
   */
  calculateMargin(
    totalPrice: number,
    totalCost: number
  ): {
    grossMargin: number;
    marginPercentage: number;
  } {
    const grossMargin = totalPrice - totalCost;
    const marginPercentage =
      totalPrice > 0 ? (grossMargin / totalPrice) * 100 : 0;

    return {
      grossMargin,
      marginPercentage,
    };
  }

  /**
   * Get pricing summary for multiple quantities
   * Useful for displaying pricing table to customers
   */
  async getPricingSummary(
    productId: string,
    variantId: string | null,
    quantities: number[],
    customization?: ICustomizationOptions
  ): Promise<
    Array<{
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      savings: number;
      savingsPercentage: number;
    }>
  > {
    const results = await Promise.all(
      quantities.map((qty) =>
        this.calculatePrice(productId, variantId, qty, customization)
      )
    );

    return results.map((r) => ({
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      totalPrice: r.totalPrice,
      savings: r.savingsVsBasePrice,
      savingsPercentage: r.savingsPercentage,
    }));
  }

  /**
   * Set pricing tiers for a product
   * @param productId - Product ID
   * @param pricingTiers - Array of pricing tiers
   * @returns Updated product
   */
  async setPricingTiers(
    productId: string,
    pricingTiers: IPricingTier[]
  ): Promise<any> {
    Logger.debug(
      `[PricingSvc] Setting pricing tiers for product: ${productId}`
    );

    // 1. Validate product exists
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    // 2. Validate pricing tiers
    const validation = this.validatePricingTiers(pricingTiers);
    if (!validation.isValid) {
      throw new ValidationException(
        `Pricing tiers không hợp lệ: ${validation.errors.join(", ")}`
      );
    }

    // 3. Update product
    product.pricingTiers = pricingTiers;
    await product.save();

    Logger.success(
      `[PricingSvc] Set ${pricingTiers.length} pricing tiers for product: ${productId}`
    );

    return product;
  }
}
