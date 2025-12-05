// src/modules/inventory/inventory.service.js
// ✅ Inventory Service - Business logic

import { Inventory } from "./inventory.model.js";
import {
  NotFoundException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class InventoryService {
  /**
   * Get or create inventory for organization
   */
  async getOrCreateInventory(organizationId) {
    let inventory = await Inventory.findOne({ organization: organizationId });

    if (!inventory) {
      inventory = await Inventory.create({
        organization: organizationId,
        items: [],
        stats: {
          totalSkus: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        },
      });
      Logger.info(
        `[InventorySvc] Created inventory for org: ${organizationId}`
      );
    }

    return inventory;
  }

  /**
   * Get inventory with items
   */
  async getInventory(organizationId, options = {}) {
    const { status, search, page = 1, limit = 50 } = options;

    const inventory = await this.getOrCreateInventory(organizationId);

    let items = inventory.items || [];

    // Filter by status
    if (status && status !== "all") {
      items = items.filter((item) => item.status === status);
    }

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter((item) =>
        item.productName.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = items.length;
    const skip = (page - 1) * limit;
    items = items.slice(skip, skip + limit);

    return {
      items,
      stats: inventory.stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add item to inventory
   */
  async addItem(organizationId, itemData) {
    Logger.debug(
      `[InventorySvc] Adding item to inventory for org: ${organizationId}`
    );

    const inventory = await this.getOrCreateInventory(organizationId);

    const {
      product,
      productName,
      productSku,
      productImage,
      quantity,
      unitCost,
      lowStockThreshold,
      customization,
      sizeBreakdown,
    } = itemData;

    // Check if product already exists
    const existingItem = inventory.items.find(
      (item) => item.product.toString() === product
    );

    if (existingItem) {
      // Update existing item
      existingItem.quantity += quantity || 0;
      existingItem.unitCost = unitCost || existingItem.unitCost;
      existingItem.lastRestockedAt = new Date();
    } else {
      // Add new item
      inventory.items.push({
        product,
        productName,
        productSku,
        productImage,
        quantity: quantity || 0,
        unitCost: unitCost || 0,
        lowStockThreshold: lowStockThreshold || 10,
        customization: customization || {},
        sizeBreakdown: sizeBreakdown || {},
        lastRestockedAt: new Date(),
      });
    }

    await inventory.save();
    Logger.success(`[InventorySvc] Added item to inventory`);

    return inventory;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    organizationId,
    itemId,
    quantity,
    operation = "set"
  ) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    switch (operation) {
      case "add":
        item.quantity += quantity;
        item.lastRestockedAt = new Date();
        break;
      case "subtract":
        if (item.quantity < quantity) {
          throw new ValidationException("Số lượng tồn kho không đủ");
        }
        item.quantity -= quantity;
        item.lastShippedAt = new Date();
        break;
      case "set":
      default:
        item.quantity = quantity;
        break;
    }

    await inventory.save();
    return inventory;
  }

  /**
   * Reserve items (for pending orders)
   */
  async reserveItems(organizationId, itemId, quantity) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    if (item.availableQuantity < quantity) {
      throw new ValidationException("Số lượng khả dụng không đủ");
    }

    item.reservedQuantity += quantity;
    await inventory.save();

    return inventory;
  }

  /**
   * Release reserved items (order cancelled)
   */
  async releaseReservedItems(organizationId, itemId, quantity) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    item.reservedQuantity = Math.max(0, item.reservedQuantity - quantity);
    await inventory.save();

    return inventory;
  }

  /**
   * Fulfill reserved items (order shipped)
   */
  async fulfillItems(organizationId, itemId, quantity) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    item.reservedQuantity = Math.max(0, item.reservedQuantity - quantity);
    item.quantity = Math.max(0, item.quantity - quantity);
    item.lastShippedAt = new Date();

    await inventory.save();
    return inventory;
  }

  /**
   * Remove item from inventory
   */
  async removeItem(organizationId, itemId) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    inventory.items.pull(itemId);
    await inventory.save();

    Logger.success(`[InventorySvc] Removed item from inventory: ${itemId}`);
    return inventory;
  }

  /**
   * Update item details
   */
  async updateItem(organizationId, itemId, updateData) {
    const inventory = await this.getOrCreateInventory(organizationId);

    const item = inventory.items.id(itemId);
    if (!item) {
      throw new NotFoundException("Inventory Item", itemId);
    }

    const allowedFields = [
      "productName",
      "productSku",
      "productImage",
      "unitCost",
      "lowStockThreshold",
      "reorderPoint",
      "customization",
      "sizeBreakdown",
      "warehouseLocation",
      "binLocation",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
      }
    });

    await inventory.save();
    return inventory;
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(organizationId) {
    const inventory = await this.getOrCreateInventory(organizationId);

    return inventory.items.filter(
      (item) => item.status === "low_stock" || item.status === "out_of_stock"
    );
  }

  /**
   * Update inventory settings
   */
  async updateSettings(organizationId, settings) {
    const inventory = await this.getOrCreateInventory(organizationId);

    inventory.settings = { ...inventory.settings, ...settings };
    await inventory.save();

    return inventory;
  }

  /**
   * Get inventory stats
   */
  async getStats(organizationId) {
    const inventory = await this.getOrCreateInventory(organizationId);
    return inventory.stats;
  }
}
