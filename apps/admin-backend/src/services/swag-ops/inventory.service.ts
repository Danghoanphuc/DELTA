// src/services/swag-ops/inventory.service.ts
// ✅ Inventory Service - Single Responsibility: Inventory Management

import mongoose from "mongoose";
import { Logger } from "../../utils/logger";
import { InventoryRepository } from "../../repositories/inventory.repository";
import {
  InventoryFilters,
  InventoryOverview,
  InventoryUpdateRequest,
} from "../../interfaces/swag-operations.interface";

export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async getOverview(filters: InventoryFilters): Promise<InventoryOverview> {
    let inventories: any[];

    if (filters.organizationId) {
      inventories = await this.inventoryRepo.findByOrganization(
        filters.organizationId
      );
    } else {
      inventories = await this.inventoryRepo.findAllWithOrganization();
    }

    const allItems: any[] = [];
    let totalValue = 0;
    let lowStockCount = 0;

    for (const inv of inventories) {
      for (const item of inv.items || []) {
        if (filters.lowStockOnly && item.status !== "low_stock") continue;

        allItems.push({
          ...item,
          organizationId: inv.organization?._id,
          organizationName: inv.organization?.businessName,
        });

        totalValue += item.totalValue || 0;
        if (item.status === "low_stock" || item.status === "out_of_stock") {
          lowStockCount++;
        }
      }
    }

    return {
      items: allItems,
      stats: {
        totalItems: allItems.length,
        totalValue,
        lowStockCount,
        organizationCount: inventories.length,
      },
    };
  }

  async updateItem(
    itemId: string,
    update: InventoryUpdateRequest,
    adminId: string,
    _note?: string
  ) {
    const result = await this.inventoryRepo.findItemById(itemId);
    if (!result) throw new Error("Item not found");

    const { inventory, itemIndex } = result;
    const item = inventory.items[itemIndex];

    // Apply quantity update
    if (update.operation === "add") {
      item.quantity += update.quantity;
    } else if (update.operation === "subtract") {
      item.quantity = Math.max(0, item.quantity - update.quantity);
    } else if (update.operation === "set") {
      item.quantity = update.quantity;
    }

    // Update status based on quantity
    if (item.quantity === 0) {
      item.status = "out_of_stock";
    } else if (item.quantity <= item.lowStockThreshold) {
      item.status = "low_stock";
    } else {
      item.status = "in_stock";
    }

    item.totalValue = item.quantity * item.unitCost;
    item.lastRestockedAt = new Date();

    await inventory.save();

    Logger.info(
      `[InventoryService] Item ${itemId} updated by admin ${adminId}`
    );

    return item;
  }

  async getAlerts() {
    const inventories = await this.inventoryRepo.findAllWithOrganization();
    const alerts: any[] = [];

    for (const inv of inventories) {
      for (const item of inv.items || []) {
        if (item.status === "out_of_stock") {
          alerts.push({
            type: "out_of_stock",
            severity: "critical",
            item: item.name,
            sku: item.sku,
            quantity: item.quantity,
            organization: inv.organization?.businessName,
            organizationId: inv.organization?._id,
          });
        } else if (item.status === "low_stock") {
          alerts.push({
            type: "low_stock",
            severity: "warning",
            item: item.name,
            sku: item.sku,
            quantity: item.quantity,
            threshold: item.lowStockThreshold,
            organization: inv.organization?.businessName,
            organizationId: inv.organization?._id,
          });
        }
      }
    }

    return alerts.sort((a, b) =>
      a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0
    );
  }
}
