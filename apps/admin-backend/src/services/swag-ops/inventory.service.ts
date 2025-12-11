// src/services/swag-ops/inventory.service.ts
// ✅ Inventory Service - Single Responsibility: Inventory Management

import mongoose from "mongoose";
import { Logger } from "../../shared/utils/logger.js";
import { InventoryRepository } from "../../repositories/inventory.repository";
import {
  InventoryFilters,
  InventoryOverview,
  InventoryUpdateRequest,
} from "../../interfaces/swag-operations.interface";

export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async getOverview(filters: InventoryFilters): Promise<InventoryOverview> {
    // Get inventory overview from repository
    const overview = await this.inventoryRepo.getInventoryOverview();

    // Get low stock items if requested
    let items: any[] = [];
    if (filters.lowStockOnly) {
      items = await this.inventoryRepo.getLowStockItems();
    } else {
      // For now, return low stock items as a placeholder
      // TODO: Implement full inventory listing if needed
      items = await this.inventoryRepo.getLowStockItems(999999);
    }

    return {
      items,
      stats: {
        totalItems: overview.totalVariants,
        totalValue: overview.totalValue,
        lowStockCount: overview.lowStockCount,
        organizationCount: 1, // Single organization for now
      },
    };
  }

  async updateItem(
    itemId: string,
    update: InventoryUpdateRequest,
    adminId: string,
    _note?: string
  ) {
    // Get current inventory levels
    const levels = await this.inventoryRepo.getInventoryLevels(itemId);
    if (!levels) throw new Error("Item not found");

    let newOnHand = levels.onHand;

    // Apply quantity update
    if (update.operation === "add") {
      newOnHand += update.quantity;
    } else if (update.operation === "subtract") {
      newOnHand = Math.max(0, newOnHand - update.quantity);
    } else if (update.operation === "set") {
      newOnHand = update.quantity;
    }

    // Update inventory levels
    await this.inventoryRepo.updateInventoryLevels(itemId, {
      onHand: newOnHand,
    });

    // Get updated levels
    const updatedLevels = await this.inventoryRepo.getInventoryLevels(itemId);

    Logger.info(
      `[InventoryService] Item ${itemId} updated by admin ${adminId}: ${levels.onHand} -> ${newOnHand}`
    );

    return {
      variantId: itemId,
      sku: updatedLevels?.sku || levels.sku,
      name: updatedLevels?.name || levels.name,
      quantity: updatedLevels?.onHand || newOnHand,
      reserved: updatedLevels?.reserved || 0,
      available: updatedLevels?.available || newOnHand,
    };
  }

  async getAlerts() {
    const lowStockItems = await this.inventoryRepo.getLowStockItems();
    const alerts: any[] = [];

    for (const item of lowStockItems) {
      if (item.available === 0) {
        alerts.push({
          type: "out_of_stock",
          severity: "critical",
          item: item.name,
          sku: item.sku,
          quantity: item.available,
          variantId: item.variantId,
        });
      } else if (item.available <= item.reorderPoint) {
        alerts.push({
          type: "low_stock",
          severity: "warning",
          item: item.name,
          sku: item.sku,
          quantity: item.available,
          threshold: item.reorderPoint,
          variantId: item.variantId,
        });
      }
    }

    return alerts.sort((a, b) =>
      a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0
    );
  }
}
