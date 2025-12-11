// @ts-nocheck
// apps/admin-backend/src/repositories/inventory.repository.ts
// ✅ Inventory Repository - Data access layer for inventory management
// Phase 4.1.1: Implement Inventory Repository

import { FilterQuery } from "mongoose";
import {
  InventoryTransaction,
  IInventoryTransaction,
  TRANSACTION_TYPES,
  REFERENCE_TYPES,
} from "../models/inventory.models.js";
import { SkuVariant } from "../models/catalog.models.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Inventory Repository
 * Handles all database operations for inventory management
 */
export class InventoryRepository {
  // ============================================
  // INVENTORY TRANSACTION OPERATIONS
  // ============================================

  /**
   * Create a new inventory transaction
   */
  async createTransaction(
    data: Partial<IInventoryTransaction>
  ): Promise<IInventoryTransaction> {
    try {
      const transaction = new InventoryTransaction(data);
      await transaction.save();

      Logger.debug(
        `[InventoryRepo] Created transaction: ${transaction._id} - ${transaction.type} - ${transaction.sku}`
      );

      return transaction;
    } catch (error) {
      Logger.error(`[InventoryRepo] Error creating transaction:`, error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<IInventoryTransaction | null> {
    return await InventoryTransaction.findById(id).lean();
  }

  /**
   * Get transactions for a SKU variant
   */
  async getTransactionsByVariant(
    variantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{
    transactions: IInventoryTransaction[];
    total: number;
  }> {
    const query: FilterQuery<IInventoryTransaction> = {
      skuVariantId: variantId,
    };

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }

    if (options.type) {
      query.type = options.type;
    }

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      InventoryTransaction.countDocuments(query),
    ]);

    return { transactions, total };
  }

  /**
   * Get transactions by reference (order, production order, etc.)
   */
  async getTransactionsByReference(
    referenceType: string,
    referenceId: string
  ): Promise<IInventoryTransaction[]> {
    return await InventoryTransaction.find({
      referenceType,
      referenceId,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get all transactions for a date range
   */
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    options: {
      type?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{
    transactions: IInventoryTransaction[];
    total: number;
  }> {
    const query: FilterQuery<IInventoryTransaction> = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (options.type) {
      query.type = options.type;
    }

    const limit = options.limit || 100;
    const skip = options.skip || 0;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      InventoryTransaction.countDocuments(query),
    ]);

    return { transactions, total };
  }

  // ============================================
  // SKU VARIANT INVENTORY OPERATIONS
  // ============================================

  /**
   * Get current inventory levels for a variant
   */
  async getInventoryLevels(variantId: string) {
    const variant = await SkuVariant.findById(variantId)
      .select("sku name inventory stockQuantity reservedQuantity")
      .lean();

    if (!variant) {
      return null;
    }

    // Support both old and new schema
    if (variant.inventory) {
      return {
        sku: variant.sku,
        name: variant.name,
        onHand: variant.inventory.onHand,
        reserved: variant.inventory.reserved,
        available: variant.inventory.available,
        inTransit: variant.inventory.inTransit,
        reorderPoint: variant.inventory.reorderPoint,
        reorderQuantity: variant.inventory.reorderQuantity,
      };
    } else {
      // Fallback to old schema
      return {
        sku: variant.sku,
        name: variant.name,
        onHand: variant.stockQuantity || 0,
        reserved: variant.reservedQuantity || 0,
        available:
          (variant.stockQuantity || 0) - (variant.reservedQuantity || 0),
        inTransit: 0,
        reorderPoint: 10,
        reorderQuantity: 50,
      };
    }
  }

  /**
   * Update inventory levels for a variant
   */
  async updateInventoryLevels(
    variantId: string,
    updates: {
      onHand?: number;
      reserved?: number;
      inTransit?: number;
    }
  ) {
    const variant = await SkuVariant.findById(variantId);
    if (!variant) {
      throw new Error(`SKU Variant ${variantId} not found`);
    }

    // Initialize inventory object if it doesn't exist
    if (!variant.inventory) {
      variant.inventory = {
        onHand: variant.stockQuantity || 0,
        reserved: variant.reservedQuantity || 0,
        available: 0,
        inTransit: 0,
        reorderPoint: 10,
        reorderQuantity: 50,
      };
    }

    // Apply updates
    if (updates.onHand !== undefined) {
      variant.inventory.onHand = updates.onHand;
    }
    if (updates.reserved !== undefined) {
      variant.inventory.reserved = updates.reserved;
    }
    if (updates.inTransit !== undefined) {
      variant.inventory.inTransit = updates.inTransit;
    }

    // Calculate available
    variant.inventory.available = Math.max(
      0,
      variant.inventory.onHand - variant.inventory.reserved
    );

    // Update old fields for backward compatibility
    variant.stockQuantity = variant.inventory.onHand;
    variant.reservedQuantity = variant.inventory.reserved;

    await variant.save();

    Logger.debug(
      `[InventoryRepo] Updated inventory for ${variant.sku}: onHand=${variant.inventory.onHand}, reserved=${variant.inventory.reserved}, available=${variant.inventory.available}`
    );

    return variant;
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold?: number): Promise<any[]> {
    const reorderThreshold = threshold || 10;

    // Query variants where available <= reorderPoint
    const variants = await SkuVariant.find({
      isActive: true,
      $or: [
        // New schema
        { "inventory.available": { $lte: reorderThreshold } },
        // Old schema fallback
        {
          $and: [
            { inventory: { $exists: false } },
            {
              $expr: {
                $lte: [
                  { $subtract: ["$stockQuantity", "$reservedQuantity"] },
                  reorderThreshold,
                ],
              },
            },
          ],
        },
      ],
    })
      .populate("productId", "name categoryId")
      .select("sku name productId inventory stockQuantity reservedQuantity")
      .lean();

    return variants.map((v: any) => ({
      variantId: v._id,
      sku: v.sku,
      name: v.name,
      productName: v.productId?.name,
      onHand: v.inventory?.onHand || v.stockQuantity || 0,
      reserved: v.inventory?.reserved || v.reservedQuantity || 0,
      available:
        v.inventory?.available ||
        (v.stockQuantity || 0) - (v.reservedQuantity || 0),
      reorderPoint: v.inventory?.reorderPoint || reorderThreshold,
      reorderQuantity: v.inventory?.reorderQuantity || 50,
    }));
  }

  /**
   * Get inventory overview (summary statistics)
   */
  async getInventoryOverview() {
    const variants = await SkuVariant.find({ isActive: true })
      .select("inventory stockQuantity reservedQuantity cost")
      .lean();

    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let totalValue = 0;
    let lowStockCount = 0;

    variants.forEach((v: any) => {
      const onHand = v.inventory?.onHand || v.stockQuantity || 0;
      const reserved = v.inventory?.reserved || v.reservedQuantity || 0;
      const available = v.inventory?.available || onHand - reserved;
      const reorderPoint = v.inventory?.reorderPoint || 10;
      const cost = v.cost || 0;

      totalOnHand += onHand;
      totalReserved += reserved;
      totalAvailable += available;
      totalValue += onHand * cost;

      if (available <= reorderPoint) {
        lowStockCount++;
      }
    });

    return {
      totalVariants: variants.length,
      totalOnHand,
      totalReserved,
      totalAvailable,
      totalValue,
      lowStockCount,
    };
  }

  /**
   * Check if variant has sufficient stock
   */
  async hasSufficientStock(
    variantId: string,
    requiredQuantity: number
  ): Promise<boolean> {
    const levels = await this.getInventoryLevels(variantId);
    if (!levels) return false;

    return levels.available >= requiredQuantity;
  }

  /**
   * Get variants by SKU list
   */
  async getVariantsBySkus(skus: string[]) {
    return await SkuVariant.find({
      sku: { $in: skus },
      isActive: true,
    })
      .select("sku name inventory stockQuantity reservedQuantity cost")
      .lean();
  }
}

export default InventoryRepository;

// Export singleton instance
export const inventoryRepository = new InventoryRepository();
