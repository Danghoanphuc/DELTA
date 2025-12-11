// @ts-nocheck
// apps/admin-backend/src/services/kitting.service.ts
// ✅ Kitting Service - Phase 6.1.1
// Quản lý quy trình đóng gói swag packs

import { SwagOrder } from "../models/swag-order.model.js";
import { SwagPack } from "../models/swag-pack.model.js";
import { SkuVariant } from "../models/sku-variant.model.js";
import { InventoryService } from "./inventory.service.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
  ConflictException,
} from "../shared/exceptions/index.js";

// ============================================
// INTERFACES
// ============================================

export interface KittingChecklistItem {
  skuVariantId: string;
  sku: string;
  productName: string;
  productImage?: string;
  quantityNeeded: number;
  quantityPacked: number;
  isPacked: boolean;
  scannedAt?: Date;
  scannedBy?: string;
}

export interface KittingChecklist {
  orderId: string;
  orderNumber: string;
  totalRecipients: number;
  items: KittingChecklistItem[];
  progress: {
    totalItems: number;
    packedItems: number;
    percentComplete: number;
  };
  status: "pending" | "in_progress" | "completed";
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  completedBy?: string;
}

export interface ScanItemData {
  sku: string;
  quantity?: number;
  scannedBy: string;
}

// ============================================
// KITTING SERVICE
// ============================================

export class KittingService {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get kitting queue - orders ready for kitting
   * Requirements: 8.1
   */
  async getKittingQueue(
    filters: {
      status?: string;
      priority?: string;
      sortBy?: string;
    } = {}
  ) {
    Logger.debug(`[KittingSvc] Getting kitting queue with filters:`, filters);

    try {
      // Find orders that are ready for kitting
      // Status: paid, production completed, QC passed
      const query: any = {
        status: { $in: ["paid", "processing"] },
        "production.status": "completed",
        "production.qcStatus": { $in: ["passed", "pending"] },
        "production.kittingStatus": { $in: ["pending", "in_progress"] },
      };

      if (filters.status) {
        query["production.kittingStatus"] = filters.status;
      }

      const sortOptions: any = {};
      if (filters.sortBy === "date") {
        sortOptions.createdAt = -1;
      } else if (filters.sortBy === "priority") {
        // Priority: scheduled send date soonest first
        sortOptions.scheduledSendDate = 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const orders = await SwagOrder.find(query)
        .populate("swagPack", "name items")
        .populate("organization", "businessName")
        .sort(sortOptions)
        .lean();

      Logger.success(
        `[KittingSvc] Found ${orders.length} orders in kitting queue`
      );

      return orders;
    } catch (error) {
      Logger.error(`[KittingSvc] Error getting kitting queue:`, error);
      throw error;
    }
  }

  /**
   * Generate kitting checklist from swag order
   * Requirements: 8.1, 8.2
   */
  async generateKittingChecklist(orderId: string): Promise<KittingChecklist> {
    Logger.debug(
      `[KittingSvc] Generating kitting checklist for order ${orderId}`
    );

    try {
      // Get order with pack details
      const order = await SwagOrder.findById(orderId)
        .populate("swagPack")
        .lean();

      if (!order) {
        throw new NotFoundException("Swag Order", orderId);
      }

      // Check if order is ready for kitting
      if (order.production?.status !== "completed") {
        throw new ConflictException(
          "Cannot start kitting - production not completed"
        );
      }

      if (
        order.production?.qcRequired &&
        order.production?.qcStatus !== "passed"
      ) {
        throw new ConflictException(
          "Cannot start kitting - QC check not passed"
        );
      }

      // Get pack items
      const pack = order.swagPack as any;
      if (!pack || !pack.items || pack.items.length === 0) {
        throw new ValidationException("Swag pack has no items");
      }

      // Generate checklist items
      const checklistItems: KittingChecklistItem[] = [];

      for (const packItem of pack.items) {
        // Get SKU variant details
        const variant = await SkuVariant.findById(packItem.product).lean();

        if (!variant) {
          Logger.warn(
            `[KittingSvc] SKU variant not found: ${packItem.product}`
          );
          continue;
        }

        // Calculate total quantity needed (quantity per pack * number of recipients)
        const quantityNeeded = packItem.quantity * order.totalRecipients;

        checklistItems.push({
          skuVariantId: variant._id.toString(),
          sku: variant.sku,
          productName: packItem.productName || variant.name,
          productImage: packItem.productImage || variant.images?.[0],
          quantityNeeded,
          quantityPacked: 0,
          isPacked: false,
        });
      }

      // Calculate progress
      const totalItems = checklistItems.length;
      const packedItems = checklistItems.filter((item) => item.isPacked).length;
      const percentComplete =
        totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

      const checklist: KittingChecklist = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        totalRecipients: order.totalRecipients,
        items: checklistItems,
        progress: {
          totalItems,
          packedItems,
          percentComplete,
        },
        status:
          order.production?.kittingStatus === "in_progress"
            ? "in_progress"
            : "pending",
        startedAt: order.production?.kittingStartedAt,
        startedBy: order.production?.kittedBy?.toString(),
      };

      Logger.success(
        `[KittingSvc] Generated checklist with ${totalItems} items for order ${order.orderNumber}`
      );

      return checklist;
    } catch (error) {
      Logger.error(`[KittingSvc] Error generating kitting checklist:`, error);
      throw error;
    }
  }

  /**
   * Start kitting process
   * Requirements: 8.2
   */
  async startKitting(orderId: string, userId: string) {
    Logger.debug(`[KittingSvc] Starting kitting for order ${orderId}`);

    try {
      const order = await SwagOrder.findById(orderId);

      if (!order) {
        throw new NotFoundException("Swag Order", orderId);
      }

      // Validate order status
      if (order.production?.status !== "completed") {
        throw new ConflictException(
          "Cannot start kitting - production not completed"
        );
      }

      if (order.production?.kittingStatus === "completed") {
        throw new ConflictException("Kitting already completed");
      }

      // Update kitting status
      if (!order.production) {
        order.production = {} as any;
      }

      order.production.kittingStatus = "in_progress";
      order.production.kittingStartedAt = new Date();
      order.production.kittedBy = userId as any;

      await order.save();

      Logger.success(
        `[KittingSvc] Started kitting for order ${order.orderNumber}`
      );

      return order;
    } catch (error) {
      Logger.error(`[KittingSvc] Error starting kitting:`, error);
      throw error;
    }
  }

  /**
   * Scan item during kitting
   * Requirements: 8.2, 8.3
   */
  async scanItem(orderId: string, scanData: ScanItemData) {
    Logger.debug(
      `[KittingSvc] Scanning item ${scanData.sku} for order ${orderId}`
    );

    try {
      const order = await SwagOrder.findById(orderId).populate("swagPack");

      if (!order) {
        throw new NotFoundException("Swag Order", orderId);
      }

      // Validate kitting status
      if (order.production?.kittingStatus !== "in_progress") {
        throw new ConflictException(
          "Kitting not in progress - please start kitting first"
        );
      }

      // Find SKU variant
      const variant = await SkuVariant.findOne({ sku: scanData.sku }).lean();

      if (!variant) {
        throw new NotFoundException("SKU", scanData.sku);
      }

      // Verify SKU is in the pack
      const pack = order.swagPack as any;
      const packItem = pack.items.find(
        (item: any) => item.product.toString() === variant._id.toString()
      );

      if (!packItem) {
        throw new ValidationException(
          `SKU ${scanData.sku} is not part of this swag pack`
        );
      }

      // Calculate expected quantity
      const expectedQuantity = packItem.quantity * order.totalRecipients;

      Logger.success(
        `[KittingSvc] Scanned ${scanData.sku} - Expected: ${expectedQuantity}`
      );

      // Return scan result
      return {
        success: true,
        sku: scanData.sku,
        productName: packItem.productName,
        expectedQuantity,
        scannedQuantity: scanData.quantity || 1,
        scannedAt: new Date(),
        scannedBy: scanData.scannedBy,
      };
    } catch (error) {
      Logger.error(`[KittingSvc] Error scanning item:`, error);
      throw error;
    }
  }

  /**
   * Complete kitting process
   * Requirements: 8.3, 8.4
   */
  async completeKitting(orderId: string, userId: string) {
    Logger.debug(`[KittingSvc] Completing kitting for order ${orderId}`);

    try {
      const order = await SwagOrder.findById(orderId).populate("swagPack");

      if (!order) {
        throw new NotFoundException("Swag Order", orderId);
      }

      // Validate kitting status
      if (order.production?.kittingStatus !== "in_progress") {
        throw new ConflictException("Kitting not in progress");
      }

      // Validate all items are packed
      // In a real implementation, we would track packed items
      // For now, we'll just mark as completed

      // Update kitting status
      if (!order.production) {
        order.production = {} as any;
      }

      order.production.kittingStatus = "completed";
      order.production.kittingCompletedAt = new Date();
      order.production.kittedBy = userId as any;

      // Update order status to ready for shipping
      order.status = "kitting" as any;

      await order.save();

      Logger.success(
        `[KittingSvc] Completed kitting for order ${order.orderNumber}`
      );

      return order;
    } catch (error) {
      Logger.error(`[KittingSvc] Error completing kitting:`, error);
      throw error;
    }
  }

  /**
   * Get kitting progress for an order
   * Requirements: 8.2
   */
  async getKittingProgress(orderId: string) {
    Logger.debug(`[KittingSvc] Getting kitting progress for order ${orderId}`);

    try {
      const checklist = await this.generateKittingChecklist(orderId);

      return {
        orderId: checklist.orderId,
        orderNumber: checklist.orderNumber,
        status: checklist.status,
        progress: checklist.progress,
        startedAt: checklist.startedAt,
        completedAt: checklist.completedAt,
      };
    } catch (error) {
      Logger.error(`[KittingSvc] Error getting kitting progress:`, error);
      throw error;
    }
  }

  /**
   * Validate inventory availability for kitting
   * Requirements: 8.2
   */
  async validateInventoryForKitting(orderId: string) {
    Logger.debug(
      `[KittingSvc] Validating inventory for kitting order ${orderId}`
    );

    try {
      const checklist = await this.generateKittingChecklist(orderId);

      const validationResults = [];

      for (const item of checklist.items) {
        const availableStock = await this.inventoryService.getAvailableStock(
          item.skuVariantId
        );

        const isAvailable = availableStock >= item.quantityNeeded;

        validationResults.push({
          sku: item.sku,
          productName: item.productName,
          quantityNeeded: item.quantityNeeded,
          availableStock,
          isAvailable,
          shortage: isAvailable ? 0 : item.quantityNeeded - availableStock,
        });
      }

      const allAvailable = validationResults.every((r) => r.isAvailable);

      Logger.success(
        `[KittingSvc] Inventory validation complete - All available: ${allAvailable}`
      );

      return {
        orderId,
        allAvailable,
        items: validationResults,
      };
    } catch (error) {
      Logger.error(
        `[KittingSvc] Error validating inventory for kitting:`,
        error
      );
      throw error;
    }
  }
}
