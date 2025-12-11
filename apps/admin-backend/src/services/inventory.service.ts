// apps/admin-backend/src/services/inventory.service.ts
// ✅ Inventory Service - Business logic for inventory management
// Phase 4.1.2: Implement Inventory Service

import { Types } from "mongoose";
import InventoryRepository from "../repositories/inventory.repository.js";
import {
  IInventoryTransaction,
  TRANSACTION_TYPES,
  REFERENCE_TYPES,
  calculateAvailableQuantity,
  needsReorder,
} from "../models/inventory.models.js";
import { Logger } from "../shared/utils/logger.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../shared/exceptions/index.js";

/**
 * Inventory Service
 * Handles inventory operations: reserve, release, adjust, track
 */
export class InventoryService {
  private repository: InventoryRepository;

  constructor() {
    this.repository = new InventoryRepository();
  }

  // ============================================
  // INVENTORY OPERATIONS
  // ============================================

  /**
   * Get available stock for a variant
   */
  async getAvailableStock(variantId: string): Promise<number> {
    Logger.debug(`[InventorySvc] Getting available stock for ${variantId}`);

    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    return levels.available;
  }

  /**
   * Reserve inventory for an order
   * Decreases available quantity, increases reserved quantity
   */
  async reserveInventory(
    variantId: string,
    quantity: number,
    orderId: string,
    orderNumber: string,
    performedBy: string,
    reason?: string
  ): Promise<void> {
    Logger.debug(
      `[InventorySvc] Reserving ${quantity} units of ${variantId} for order ${orderNumber}`
    );

    // Validate quantity
    if (quantity <= 0) {
      throw new ValidationException("Quantity must be greater than 0");
    }

    // Get current levels
    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    // Check if sufficient stock available
    if (levels.available < quantity) {
      throw new ConflictException(
        `Insufficient stock for ${levels.sku}. Available: ${levels.available}, Required: ${quantity}`
      );
    }

    // Update inventory levels
    await this.repository.updateInventoryLevels(variantId, {
      reserved: levels.reserved + quantity,
    });

    // Record transaction
    await this.recordTransaction({
      skuVariantId: new Types.ObjectId(variantId),
      sku: levels.sku,
      productName: levels.name,
      type: TRANSACTION_TYPES.RESERVE,
      quantityBefore: levels.available,
      quantityChange: -quantity,
      quantityAfter: levels.available - quantity,
      referenceType: REFERENCE_TYPES.SWAG_ORDER,
      referenceId: new Types.ObjectId(orderId),
      referenceNumber: orderNumber,
      unitCost: 0,
      totalCost: 0,
      reason: reason || `Reserved for order ${orderNumber}`,
      performedBy: new Types.ObjectId(performedBy),
    });

    Logger.success(
      `[InventorySvc] Reserved ${quantity} units of ${levels.sku} for order ${orderNumber}`
    );

    // Check if reorder needed
    const updatedLevels = await this.repository.getInventoryLevels(variantId);
    if (
      updatedLevels &&
      needsReorder(updatedLevels.available, updatedLevels.reorderPoint)
    ) {
      Logger.warn(
        `[InventorySvc] Low stock alert: ${updatedLevels.sku} - Available: ${updatedLevels.available}, Reorder Point: ${updatedLevels.reorderPoint}`
      );
      // TODO: Trigger low stock alert/notification
    }
  }

  /**
   * Release reserved inventory (e.g., when order is cancelled)
   * Increases available quantity, decreases reserved quantity
   */
  async releaseInventory(
    variantId: string,
    quantity: number,
    orderId: string,
    orderNumber: string,
    performedBy: string,
    reason?: string
  ): Promise<void> {
    Logger.debug(
      `[InventorySvc] Releasing ${quantity} units of ${variantId} from order ${orderNumber}`
    );

    // Validate quantity
    if (quantity <= 0) {
      throw new ValidationException("Quantity must be greater than 0");
    }

    // Get current levels
    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    // Check if sufficient reserved quantity
    if (levels.reserved < quantity) {
      throw new ConflictException(
        `Cannot release ${quantity} units. Only ${levels.reserved} units are reserved for ${levels.sku}`
      );
    }

    // Update inventory levels
    await this.repository.updateInventoryLevels(variantId, {
      reserved: levels.reserved - quantity,
    });

    // Record transaction
    await this.recordTransaction({
      skuVariantId: new Types.ObjectId(variantId),
      sku: levels.sku,
      productName: levels.name,
      type: TRANSACTION_TYPES.RELEASE,
      quantityBefore: levels.available,
      quantityChange: quantity,
      quantityAfter: levels.available + quantity,
      referenceType: REFERENCE_TYPES.SWAG_ORDER,
      referenceId: new Types.ObjectId(orderId),
      referenceNumber: orderNumber,
      unitCost: 0,
      totalCost: 0,
      reason: reason || `Released from cancelled order ${orderNumber}`,
      performedBy: new Types.ObjectId(performedBy),
    });

    Logger.success(
      `[InventorySvc] Released ${quantity} units of ${levels.sku} from order ${orderNumber}`
    );
  }

  /**
   * Adjust inventory manually (increase or decrease)
   */
  async adjustInventory(
    variantId: string,
    quantityChange: number,
    reason: string,
    performedBy: string,
    notes?: string
  ): Promise<void> {
    Logger.debug(
      `[InventorySvc] Adjusting inventory for ${variantId} by ${quantityChange}`
    );

    // Validate
    if (quantityChange === 0) {
      throw new ValidationException("Quantity change cannot be 0");
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationException("Reason is required for manual adjustment");
    }

    // Get current levels
    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    // Calculate new onHand quantity
    const newOnHand = levels.onHand + quantityChange;

    // Validate new quantity
    if (newOnHand < 0) {
      throw new ValidationException(
        `Cannot adjust inventory below 0. Current: ${levels.onHand}, Change: ${quantityChange}`
      );
    }

    // Check if new onHand can cover reserved quantity
    if (newOnHand < levels.reserved) {
      throw new ConflictException(
        `Cannot reduce inventory below reserved quantity. Reserved: ${levels.reserved}, New OnHand: ${newOnHand}`
      );
    }

    // Update inventory levels
    await this.repository.updateInventoryLevels(variantId, {
      onHand: newOnHand,
    });

    // Record transaction
    await this.recordTransaction({
      skuVariantId: new Types.ObjectId(variantId),
      sku: levels.sku,
      productName: levels.name,
      type: TRANSACTION_TYPES.ADJUSTMENT,
      quantityBefore: levels.onHand,
      quantityChange,
      quantityAfter: newOnHand,
      referenceType: REFERENCE_TYPES.MANUAL_ADJUSTMENT,
      referenceId: new Types.ObjectId(performedBy), // Use performedBy as reference
      unitCost: 0,
      totalCost: 0,
      reason,
      notes,
      performedBy: new Types.ObjectId(performedBy),
    });

    Logger.success(
      `[InventorySvc] Adjusted inventory for ${levels.sku} by ${quantityChange}. New onHand: ${newOnHand}`
    );
  }

  /**
   * Record a purchase (receiving stock from supplier)
   */
  async recordPurchase(
    variantId: string,
    quantity: number,
    unitCost: number,
    purchaseOrderId: string,
    purchaseOrderNumber: string,
    performedBy: string,
    notes?: string
  ): Promise<void> {
    Logger.debug(
      `[InventorySvc] Recording purchase of ${quantity} units for ${variantId}`
    );

    // Validate
    if (quantity <= 0) {
      throw new ValidationException("Quantity must be greater than 0");
    }

    if (unitCost < 0) {
      throw new ValidationException("Unit cost cannot be negative");
    }

    // Get current levels
    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    // Update inventory levels
    const newOnHand = levels.onHand + quantity;
    await this.repository.updateInventoryLevels(variantId, {
      onHand: newOnHand,
    });

    // Record transaction
    await this.recordTransaction({
      skuVariantId: new Types.ObjectId(variantId),
      sku: levels.sku,
      productName: levels.name,
      type: TRANSACTION_TYPES.PURCHASE,
      quantityBefore: levels.onHand,
      quantityChange: quantity,
      quantityAfter: newOnHand,
      referenceType: REFERENCE_TYPES.PURCHASE_ORDER,
      referenceId: new Types.ObjectId(purchaseOrderId),
      referenceNumber: purchaseOrderNumber,
      unitCost,
      totalCost: unitCost * quantity,
      reason: `Purchase from PO ${purchaseOrderNumber}`,
      notes,
      performedBy: new Types.ObjectId(performedBy),
    });

    Logger.success(
      `[InventorySvc] Recorded purchase of ${quantity} units for ${levels.sku}. New onHand: ${newOnHand}`
    );
  }

  /**
   * Record a sale (fulfilling an order)
   */
  async recordSale(
    variantId: string,
    quantity: number,
    unitCost: number,
    orderId: string,
    orderNumber: string,
    performedBy: string
  ): Promise<void> {
    Logger.debug(
      `[InventorySvc] Recording sale of ${quantity} units for ${variantId}`
    );

    // Validate
    if (quantity <= 0) {
      throw new ValidationException("Quantity must be greater than 0");
    }

    // Get current levels
    const levels = await this.repository.getInventoryLevels(variantId);
    if (!levels) {
      throw new NotFoundException("SKU Variant", variantId);
    }

    // Check if sufficient reserved quantity
    if (levels.reserved < quantity) {
      Logger.warn(
        `[InventorySvc] Warning: Selling ${quantity} units but only ${levels.reserved} reserved for ${levels.sku}`
      );
    }

    // Update inventory levels (decrease both onHand and reserved)
    const newOnHand = levels.onHand - quantity;
    const newReserved = Math.max(0, levels.reserved - quantity);

    await this.repository.updateInventoryLevels(variantId, {
      onHand: newOnHand,
      reserved: newReserved,
    });

    // Record transaction
    await this.recordTransaction({
      skuVariantId: new Types.ObjectId(variantId),
      sku: levels.sku,
      productName: levels.name,
      type: TRANSACTION_TYPES.SALE,
      quantityBefore: levels.onHand,
      quantityChange: -quantity,
      quantityAfter: newOnHand,
      referenceType: REFERENCE_TYPES.SWAG_ORDER,
      referenceId: new Types.ObjectId(orderId),
      referenceNumber: orderNumber,
      unitCost,
      totalCost: unitCost * quantity,
      reason: `Sale for order ${orderNumber}`,
      performedBy: new Types.ObjectId(performedBy),
    });

    Logger.success(
      `[InventorySvc] Recorded sale of ${quantity} units for ${levels.sku}. New onHand: ${newOnHand}`
    );
  }

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  /**
   * Record an inventory transaction
   */
  async recordTransaction(
    data: Partial<IInventoryTransaction>
  ): Promise<IInventoryTransaction> {
    return await this.repository.createTransaction(data);
  }

  /**
   * Get transaction history for a variant
   */
  async getTransactionHistory(
    variantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const result = await this.repository.getTransactionsByVariant(variantId, {
      startDate: options.startDate,
      endDate: options.endDate,
      type: options.type,
      limit,
      skip,
    });

    return {
      transactions: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  // ============================================
  // REPORTING & ANALYTICS
  // ============================================

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold?: number) {
    Logger.debug(
      `[InventorySvc] Getting low stock items (threshold: ${threshold || 10})`
    );

    const items = await this.repository.getLowStockItems(threshold);

    Logger.debug(`[InventorySvc] Found ${items.length} low stock items`);

    return items;
  }

  /**
   * Get inventory overview
   */
  async getInventoryOverview() {
    Logger.debug(`[InventorySvc] Getting inventory overview`);

    const overview = await this.repository.getInventoryOverview();

    Logger.debug(
      `[InventorySvc] Inventory overview: ${overview.totalVariants} variants, ${overview.totalOnHand} onHand, ${overview.lowStockCount} low stock`
    );

    return overview;
  }

  /**
   * Get inventory levels for multiple variants
   */
  async getInventoryLevelsBulk(variantIds: string[]) {
    const levels = await Promise.all(
      variantIds.map((id) => this.repository.getInventoryLevels(id))
    );

    return levels.filter((l) => l !== null);
  }

  /**
   * Check if order can be fulfilled (all items have sufficient stock)
   */
  async canFulfillOrder(
    items: { variantId: string; quantity: number }[]
  ): Promise<{
    canFulfill: boolean;
    insufficientItems: {
      variantId: string;
      sku: string;
      required: number;
      available: number;
    }[];
  }> {
    const insufficientItems: any[] = [];

    for (const item of items) {
      const levels = await this.repository.getInventoryLevels(item.variantId);
      if (!levels) {
        insufficientItems.push({
          variantId: item.variantId,
          sku: "UNKNOWN",
          required: item.quantity,
          available: 0,
        });
        continue;
      }

      if (levels.available < item.quantity) {
        insufficientItems.push({
          variantId: item.variantId,
          sku: levels.sku,
          required: item.quantity,
          available: levels.available,
        });
      }
    }

    return {
      canFulfill: insufficientItems.length === 0,
      insufficientItems,
    };
  }
}

export default InventoryService;
