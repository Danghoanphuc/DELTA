// apps/admin-backend/src/services/catalog.variant-generation.service.ts
// ✅ Phase 3.1.3: Enhanced Variant Generation Service
// Auto-generate SKUs, supplier mappings, inventory tracking

import {
  CatalogProduct,
  SkuVariant,
  Supplier,
} from "../models/catalog.models.js";
import mongoose from "mongoose";
import { Logger } from "../shared/utils/logger.js";

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Attribute combination for variant generation
 */
export interface IAttributeCombination {
  name: string; // "size", "color", "material"
  value: string; // "L", "Red", "Cotton"
  displayValue?: string; // "Large", "Red", "100% Cotton"
}

/**
 * Supplier mapping for a variant
 */
export interface ISupplierMapping {
  supplierId: mongoose.Types.ObjectId;
  supplierSku: string;
  cost: number;
  leadTime: {
    min: number;
    max: number;
    unit: "days" | "weeks";
  };
  moq: number; // Minimum Order Quantity
  isPreferred: boolean;
}

/**
 * Inventory tracking for a variant
 */
export interface IInventoryTracking {
  onHand: number; // Physical stock
  reserved: number; // Reserved for orders
  available: number; // onHand - reserved
  inTransit: number; // Ordered from supplier
  locations?: {
    warehouseId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  reorderPoint: number;
  reorderQuantity: number;
  lastRestockDate?: Date;
  nextRestockDate?: Date;
}

/**
 * Performance metrics for a variant
 */
export interface IPerformanceMetrics {
  totalSold: number;
  totalRevenue: number;
  averageMargin: number;
  returnRate: number;
  averageLeadTime: number;
}

/**
 * Enhanced SKU Variant with new fields
 */
export interface IEnhancedSkuVariant {
  // Existing fields
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  attributes: IAttributeCombination[];
  price?: number;
  cost?: number;

  // ✅ NEW: Supplier Mappings
  supplierMappings: ISupplierMapping[];

  // ✅ NEW: Inventory Tracking
  inventory: IInventoryTracking;

  // ✅ NEW: Performance Metrics
  metrics: IPerformanceMetrics;
}

/**
 * Options for variant generation
 */
export interface IVariantGenerationOptions {
  // SKU generation
  skuPrefix?: string;
  skuSeparator?: string;

  // Pricing
  useProductPricing?: boolean;
  priceAdjustment?: number; // percentage

  // Inventory
  initialStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;

  // Supplier
  defaultSupplierId?: mongoose.Types.ObjectId;

  // Other
  setFirstAsDefault?: boolean;
}

// ============================================
// VARIANT GENERATION SERVICE
// ============================================
export class VariantGenerationService {
  /**
   * Generate SKU for a variant
   * Format: {PRODUCT_SKU}-{ATTR1}-{ATTR2}-{ATTR3}
   * Example: TSH-001-L-RED-COT
   */
  generateSku(
    productSku: string,
    attributes: IAttributeCombination[],
    options?: { separator?: string; maxLength?: number }
  ): string {
    const separator = options?.separator || "-";
    const maxLength = options?.maxLength || 50;

    // Create attribute suffix
    const attrSuffix = attributes
      .map((attr) => {
        // Take first 3 characters of value, uppercase
        return attr.value
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
      })
      .join(separator);

    const sku = `${productSku}${separator}${attrSuffix}`;

    // Truncate if too long
    return sku.length > maxLength ? sku.substring(0, maxLength) : sku;
  }

  /**
   * Generate variant name
   * Format: {PRODUCT_NAME} - {ATTR1} - {ATTR2}
   * Example: "T-Shirt - Large - Red - Cotton"
   */
  generateVariantName(
    productName: string,
    attributes: IAttributeCombination[]
  ): string {
    const attrStr = attributes
      .map((attr) => attr.displayValue || attr.value)
      .join(" - ");

    return `${productName} - ${attrStr}`;
  }

  /**
   * Create supplier mappings for a variant
   */
  async createSupplierMappings(
    productId: mongoose.Types.ObjectId,
    variantSku: string,
    defaultSupplierId?: mongoose.Types.ObjectId
  ): Promise<ISupplierMapping[]> {
    const mappings: ISupplierMapping[] = [];

    // Get product's supplier
    const product = await CatalogProduct.findById(productId).lean();
    if (!product) return mappings;

    const supplierId = defaultSupplierId || product.supplierId;
    if (!supplierId) return mappings;

    // Get supplier details
    const supplier = await Supplier.findById(supplierId).lean();
    if (!supplier) return mappings;

    // Create mapping
    mappings.push({
      supplierId: supplier._id,
      supplierSku: `${supplier.code}-${variantSku}`,
      cost: product.baseCost || 0,
      leadTime: supplier.leadTime,
      moq: supplier.minimumOrderQuantity || 1,
      isPreferred: supplier.isPreferred || true,
    });

    return mappings;
  }

  /**
   * Initialize inventory tracking for a variant
   */
  initializeInventory(options?: {
    initialStock?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
  }): IInventoryTracking {
    const initialStock = options?.initialStock || 0;

    return {
      onHand: initialStock,
      reserved: 0,
      available: initialStock,
      inTransit: 0,
      locations: [],
      reorderPoint: options?.reorderPoint || 10,
      reorderQuantity: options?.reorderQuantity || 50,
      lastRestockDate: initialStock > 0 ? new Date() : undefined,
      nextRestockDate: undefined,
    };
  }

  /**
   * Initialize performance metrics
   */
  initializeMetrics(): IPerformanceMetrics {
    return {
      totalSold: 0,
      totalRevenue: 0,
      averageMargin: 0,
      returnRate: 0,
      averageLeadTime: 0,
    };
  }

  /**
   * Generate all possible combinations of attributes
   * Example:
   *   sizes: ["S", "M", "L"]
   *   colors: ["Red", "Blue"]
   *   Result: [
   *     [{name: "size", value: "S"}, {name: "color", value: "Red"}],
   *     [{name: "size", value: "S"}, {name: "color", value: "Blue"}],
   *     ...
   *   ]
   */
  generateAttributeCombinations(
    attributeOptions: {
      name: string;
      values: string[];
      displayValues?: string[];
    }[]
  ): IAttributeCombination[][] {
    if (attributeOptions.length === 0) return [];

    const combinations: IAttributeCombination[][] = [[]];

    for (const attrOption of attributeOptions) {
      const newCombinations: IAttributeCombination[][] = [];

      for (const combination of combinations) {
        for (let i = 0; i < attrOption.values.length; i++) {
          const value = attrOption.values[i];
          const displayValue = attrOption.displayValues?.[i] || value;

          newCombinations.push([
            ...combination,
            {
              name: attrOption.name,
              value,
              displayValue,
            },
          ]);
        }
      }

      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    return combinations;
  }

  /**
   * Generate variants for a product
   * Main method that orchestrates the entire variant generation process
   */
  async generateVariants(
    productId: string,
    attributeOptions: {
      name: string;
      values: string[];
      displayValues?: string[];
    }[],
    options?: IVariantGenerationOptions
  ): Promise<any[]> {
    Logger.debug(
      `[VariantGenSvc] Generating variants for product: ${productId}`
    );

    // Get product
    const product = await CatalogProduct.findById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Generate all combinations
    const combinations = this.generateAttributeCombinations(attributeOptions);
    Logger.debug(
      `[VariantGenSvc] Generated ${combinations.length} combinations`
    );

    if (combinations.length === 0) {
      throw new Error("No attribute combinations generated");
    }

    if (combinations.length > 1000) {
      throw new Error(
        "Too many combinations (max 1000). Please reduce attribute options."
      );
    }

    // Generate variants
    const variants = [];

    for (let i = 0; i < combinations.length; i++) {
      const attrs = combinations[i];

      // Generate SKU
      const sku = this.generateSku(product.sku, attrs, {
        separator: options?.skuSeparator,
      });

      // Check if SKU already exists
      const existing = await SkuVariant.findOne({ sku });
      if (existing) {
        Logger.warn(`[VariantGenSvc] SKU already exists: ${sku}, skipping`);
        continue;
      }

      // Generate name
      const name = this.generateVariantName(product.name, attrs);

      // Calculate price
      let price = product.basePrice;
      if (options?.priceAdjustment) {
        price = price * (1 + options.priceAdjustment / 100);
      }

      // Create supplier mappings
      const supplierMappings = await this.createSupplierMappings(
        product._id,
        sku,
        options?.defaultSupplierId
      );

      // Initialize inventory
      const inventory = this.initializeInventory({
        initialStock: options?.initialStock,
        reorderPoint: options?.reorderPoint,
        reorderQuantity: options?.reorderQuantity,
      });

      // Initialize metrics
      const metrics = this.initializeMetrics();

      // Create variant
      const variant = new SkuVariant({
        productId: product._id,
        sku,
        name,
        attributes: attrs,
        price,
        cost: product.baseCost,
        stockQuantity: inventory.onHand,
        reservedQuantity: inventory.reserved,
        lowStockThreshold: inventory.reorderPoint,
        isActive: true,
        isDefault: i === 0 && options?.setFirstAsDefault !== false,

        // ✅ NEW FIELDS (will be added via migration)
        // supplierMappings,
        // inventory,
        // metrics,
      });

      variants.push(variant);
    }

    // Bulk insert
    const created = await SkuVariant.insertMany(variants);
    Logger.success(`[VariantGenSvc] Created ${created.length} variants`);

    // Update product
    const variantAttributes = [
      ...new Set(combinations.flat().map((a) => a.name)),
    ];
    await CatalogProduct.findByIdAndUpdate(productId, {
      hasVariants: true,
      variantAttributes,
    });

    Logger.success(
      `[VariantGenSvc] Updated product with variant attributes: ${variantAttributes.join(
        ", "
      )}`
    );

    return created;
  }

  /**
   * Update supplier mapping for a variant
   */
  async updateSupplierMapping(
    variantId: string,
    supplierId: string,
    mapping: Partial<ISupplierMapping>
  ): Promise<any> {
    // This will be implemented after migration adds supplierMappings field
    Logger.debug(
      `[VariantGenSvc] Update supplier mapping: ${variantId} -> ${supplierId}`
    );

    // For now, just log
    // In future: update the supplierMappings array in the variant document

    return {
      success: true,
      message: "Supplier mapping update pending migration",
    };
  }

  /**
   * Update inventory for a variant
   */
  async updateInventory(
    variantId: string,
    updates: Partial<IInventoryTracking>
  ): Promise<any> {
    Logger.debug(`[VariantGenSvc] Update inventory: ${variantId}`);

    // Update existing fields
    const updateData: any = {};

    if (updates.onHand !== undefined) {
      updateData.stockQuantity = updates.onHand;
    }

    if (updates.reserved !== undefined) {
      updateData.reservedQuantity = updates.reserved;
    }

    if (updates.reorderPoint !== undefined) {
      updateData.lowStockThreshold = updates.reorderPoint;
    }

    const variant = await SkuVariant.findByIdAndUpdate(variantId, updateData, {
      new: true,
    });

    Logger.success(
      `[VariantGenSvc] Updated inventory for variant: ${variant?.sku}`
    );

    return variant;
  }

  /**
   * Calculate available stock
   */
  calculateAvailableStock(onHand: number, reserved: number): number {
    return Math.max(0, onHand - reserved);
  }

  /**
   * Check if reorder is needed
   */
  needsReorder(available: number, reorderPoint: number): boolean {
    return available <= reorderPoint;
  }

  /**
   * Get low stock variants
   */
  async getLowStockVariants(threshold?: number): Promise<any[]> {
    const filter: any = { isActive: true };

    if (threshold !== undefined) {
      filter.stockQuantity = { $lte: threshold };
    } else {
      // Use variant's own threshold
      filter.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] };
    }

    const variants = await SkuVariant.find(filter)
      .populate("productId", "name thumbnailUrl")
      .sort({ stockQuantity: 1 })
      .lean();

    Logger.debug(`[VariantGenSvc] Found ${variants.length} low stock variants`);

    return variants;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================
export const variantGenerationService = new VariantGenerationService();
export default variantGenerationService;
