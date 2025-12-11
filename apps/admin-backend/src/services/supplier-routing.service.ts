// @ts-nocheck
import { Logger } from "../shared/utils/logger.js";
import { SupplierVariantMapping } from "../models/supplier-variant-mapping.model.js";
import { SkuTranslationService } from "./sku-translation.service.js";
import { SupplierAdapterFactory } from "./suppliers/supplier-adapter.factory.js";
import { NotFoundException } from "../shared/exceptions/index.js";
import type { Types } from "mongoose";

/**
 * Supplier Routing Service
 *
 * Purpose: Intelligently select the best supplier for each order item
 *
 * Routing Rules (in priority order):
 * 1. Hard Rule: Stock availability (must have stock > 0)
 * 2. Soft Rule: Preferred supplier flag (set by admin)
 * 3. Optimization: Lowest cost (maximize profit)
 * 4. Fallback: Fastest lead time
 */

export interface SupplierRoutingPlan {
  routes: Map<
    string,
    {
      supplierId: string;
      supplierName: string;
      items: Array<{
        internalSku: string;
        supplierSku: string;
        skuVariantId: Types.ObjectId;
        quantity: number;
        cost: number;
        leadTime: { min: number; max: number; unit: string };
      }>;
    }
  >;
  unroutableItems: Array<{
    sku: string;
    reason: string;
  }>;
}

export interface InventorySummary {
  sku: string;
  totalAvailable: number;
  suppliers: Array<{
    supplierId: Types.ObjectId;
    supplierName: string;
    available: boolean;
    quantity: number;
    leadTime: { min: number; max: number; unit: string };
  }>;
}

export class SupplierRoutingService {
  constructor(
    private translationService: SkuTranslationService,
    private supplierAdapterFactory: SupplierAdapterFactory
  ) {}

  /**
   * Select best supplier for a single SKU
   * @param sku - Internal SKU
   * @param quantity - Order quantity
   * @returns Selected supplier mapping
   */
  async selectSupplier(
    sku: string,
    quantity: number
  ): Promise<SupplierVariantMapping | null> {
    Logger.debug(
      `[SupplierRouting] Selecting supplier for SKU: ${sku}, quantity: ${quantity}`
    );

    // 1. Get all supplier options
    const options = await SupplierVariantMapping.find({
      sku: sku,
      syncStatus: "active",
    })
      .populate("supplierId")
      .lean();

    if (options.length === 0) {
      Logger.warn(`[SupplierRouting] No suppliers found for SKU: ${sku}`);
      return null;
    }

    Logger.debug(
      `[SupplierRouting] Found ${options.length} supplier options for SKU: ${sku}`
    );

    // 2. Filter by stock availability (Hard Rule)
    const availableOptions = options.filter(
      (opt) => opt.isAvailable && opt.stockQuantity >= quantity
    );

    if (availableOptions.length === 0) {
      Logger.warn(
        `[SupplierRouting] No suppliers with sufficient stock for SKU: ${sku} (need ${quantity})`
      );
      return null;
    }

    Logger.debug(
      `[SupplierRouting] ${availableOptions.length} suppliers have sufficient stock`
    );

    // 3. Check MOQ
    const validOptions = availableOptions.filter((opt) => quantity >= opt.moq);

    if (validOptions.length === 0) {
      Logger.warn(
        `[SupplierRouting] Quantity ${quantity} below MOQ for SKU: ${sku}`
      );
      return null;
    }

    Logger.debug(
      `[SupplierRouting] ${validOptions.length} suppliers meet MOQ requirement`
    );

    // 4. Sort by priority (Soft Rules)
    const sorted = validOptions.sort((a, b) => {
      // Priority 1: Preferred supplier
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;

      // Priority 2: Explicit priority number
      if (a.priority !== b.priority) return a.priority - b.priority;

      // Priority 3: Lowest cost
      if (a.cost !== b.cost) return a.cost - b.cost;

      // Priority 4: Fastest lead time
      return a.leadTime.min - b.leadTime.min;
    });

    const selected = sorted[0];
    Logger.success(
      `[SupplierRouting] Selected supplier ${selected.supplierId} for SKU ${sku} (cost: ${selected.cost}, lead time: ${selected.leadTime.min}-${selected.leadTime.max} ${selected.leadTime.unit})`
    );

    return selected as any; // Type assertion for populated supplierId
  }

  /**
   * Route entire order to suppliers
   * @param orderItems - Order items
   * @returns Routing plan (supplier → items)
   */
  async routeOrder(
    orderItems: Array<{
      sku: string;
      skuVariantId: Types.ObjectId;
      quantity: number;
      productName: string;
    }>
  ): Promise<SupplierRoutingPlan> {
    Logger.info(
      `[SupplierRouting] Routing order with ${orderItems.length} items`
    );

    const routingPlan: SupplierRoutingPlan = {
      routes: new Map(),
      unroutableItems: [],
    };

    for (const item of orderItems) {
      Logger.debug(
        `[SupplierRouting] Processing item: ${item.productName} (${item.sku}) x${item.quantity}`
      );

      const supplier = await this.selectSupplier(item.sku, item.quantity);

      if (!supplier) {
        Logger.warn(
          `[SupplierRouting] Cannot route item: ${item.sku} - No available supplier`
        );
        routingPlan.unroutableItems.push({
          sku: item.sku,
          reason: "No available supplier with sufficient stock",
        });
        continue;
      }

      const supplierId = (supplier.supplierId as any)._id.toString();
      const supplierName = (supplier.supplierId as any).name;

      if (!routingPlan.routes.has(supplierId)) {
        routingPlan.routes.set(supplierId, {
          supplierId: supplierId,
          supplierName: supplierName,
          items: [],
        });
      }

      routingPlan.routes.get(supplierId)!.items.push({
        internalSku: item.sku,
        supplierSku: supplier.supplierSku,
        skuVariantId: item.skuVariantId,
        quantity: item.quantity,
        cost: supplier.cost,
        leadTime: supplier.leadTime,
      });

      Logger.debug(
        `[SupplierRouting] Routed ${item.sku} to supplier ${supplierName}`
      );
    }

    Logger.success(
      `[SupplierRouting] Routing complete: ${routingPlan.routes.size} suppliers, ${routingPlan.unroutableItems.length} unroutable items`
    );

    return routingPlan;
  }

  /**
   * Real-time inventory check across all suppliers
   * @param sku - Internal SKU
   * @returns Aggregated inventory status
   */
  async checkInventoryAcrossSuppliers(sku: string): Promise<InventorySummary> {
    Logger.debug(
      `[SupplierRouting] Checking inventory across suppliers for SKU: ${sku}`
    );

    const mappings = await SupplierVariantMapping.find({
      sku: sku,
      syncStatus: "active",
    })
      .populate("supplierId")
      .lean();

    const summary: InventorySummary = {
      sku: sku,
      totalAvailable: 0,
      suppliers: [],
    };

    for (const mapping of mappings) {
      const supplierData = mapping.supplierId as any;
      const adapter = SupplierAdapterFactory.create(supplierData.type);

      try {
        const status = await adapter.checkInventory(mapping.supplierSku);

        summary.suppliers.push({
          supplierId: supplierData._id,
          supplierName: supplierData.name,
          available: status.available,
          quantity: status.quantity,
          leadTime: status.leadTime,
        });

        if (status.available) {
          summary.totalAvailable += status.quantity;
        }

        Logger.debug(
          `[SupplierRouting] ${supplierData.name}: ${
            status.available ? status.quantity : "Out of stock"
          }`
        );
      } catch (error) {
        Logger.error(
          `[SupplierRouting] Failed to check inventory for ${mapping.supplierSku}:`,
          error
        );
      }
    }

    Logger.success(
      `[SupplierRouting] Total available across ${summary.suppliers.length} suppliers: ${summary.totalAvailable}`
    );

    return summary;
  }

  /**
   * Get routing statistics
   * @param dateRange - Date range for statistics
   * @returns Routing statistics
   */
  async getRoutingStatistics(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalOrders: number;
    successfulRoutes: number;
    failedRoutes: number;
    supplierDistribution: Map<string, number>;
  }> {
    // TODO: Implement routing statistics
    // This would query production orders and analyze routing patterns
    throw new Error("Not implemented yet");
  }
}
