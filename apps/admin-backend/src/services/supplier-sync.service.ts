import { Logger } from "../shared/utils/logger.js";
import { SupplierVariantMapping } from "../models/supplier-variant-mapping.model.js";
import { Supplier } from "../models/supplier.model.js";
import { SupplierAdapterFactory } from "./suppliers/supplier-adapter.factory.js";
import cron from "node-cron";

/**
 * Supplier Sync Service
 *
 * Purpose: Synchronize inventory, pricing, and catalog from suppliers
 *
 * Sync Types:
 * 1. Inventory Sync - Update stock levels
 * 2. Pricing Sync - Update costs
 * 3. Catalog Sync - Sync product catalog
 *
 * Triggers:
 * 1. Webhooks - Real-time updates from suppliers
 * 2. Scheduled Jobs - Daily/hourly sync
 * 3. Manual Trigger - Admin-initiated sync
 */

export class SupplierSyncService {
  private adapterFactory: SupplierAdapterFactory;

  constructor() {
    this.adapterFactory = new SupplierAdapterFactory();
  }

  /**
   * Sync inventory from supplier
   * @param supplierId - Supplier ID
   * @returns Sync result
   */
  async syncInventory(supplierId: string): Promise<{
    success: boolean;
    updated: number;
    errors: number;
  }> {
    Logger.info(
      `[SupplierSync] Starting inventory sync for supplier: ${supplierId}`
    );

    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw new Error(`Supplier not found: ${supplierId}`);
      }

      const adapter = this.adapterFactory.create(supplier.type);
      const mappings = await SupplierVariantMapping.find({
        supplierId: supplierId,
        syncStatus: "active",
      });

      Logger.debug(
        `[SupplierSync] Found ${mappings.length} mappings to sync for ${supplier.name}`
      );

      let updated = 0;
      let errors = 0;

      for (const mapping of mappings) {
        try {
          const status = await adapter.checkInventory(mapping.supplierSku);

          mapping.isAvailable = status.available;
          mapping.stockQuantity = status.quantity;
          mapping.lastSyncedAt = new Date();
          await mapping.save();

          updated++;

          Logger.debug(
            `[SupplierSync] Updated ${mapping.sku}: ${
              status.available ? status.quantity : "Out of stock"
            }`
          );
        } catch (error) {
          Logger.error(`[SupplierSync] Failed to sync ${mapping.sku}:`, error);
          mapping.syncStatus = "error";
          await mapping.save();
          errors++;
        }
      }

      Logger.success(
        `[SupplierSync] Inventory sync complete: ${updated} updated, ${errors} errors`
      );

      return { success: true, updated, errors };
    } catch (error) {
      Logger.error(`[SupplierSync] Inventory sync failed:`, error);
      return { success: false, updated: 0, errors: 0 };
    }
  }

  /**
   * Sync pricing from supplier
   * @param supplierId - Supplier ID
   * @returns Sync result
   */
  async syncPricing(supplierId: string): Promise<{
    success: boolean;
    updated: number;
    errors: number;
  }> {
    Logger.info(
      `[SupplierSync] Starting pricing sync for supplier: ${supplierId}`
    );

    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw new Error(`Supplier not found: ${supplierId}`);
      }

      const adapter = this.adapterFactory.create(supplier.type);
      const mappings = await SupplierVariantMapping.find({
        supplierId: supplierId,
        syncStatus: "active",
      });

      Logger.debug(
        `[SupplierSync] Found ${mappings.length} mappings to sync for ${supplier.name}`
      );

      let updated = 0;
      let errors = 0;

      for (const mapping of mappings) {
        try {
          // Get product details from supplier
          const catalog = await adapter.getProductCatalog();
          const product = catalog.find((p) => p.sku === mapping.supplierSku);

          if (product) {
            const oldCost = mapping.cost;
            mapping.cost = product.cost;
            mapping.lastSyncedAt = new Date();
            await mapping.save();

            if (oldCost !== product.cost) {
              Logger.info(
                `[SupplierSync] Price changed for ${mapping.sku}: ${oldCost} → ${product.cost}`
              );
            }

            updated++;
          }
        } catch (error) {
          Logger.error(
            `[SupplierSync] Failed to sync pricing for ${mapping.sku}:`,
            error
          );
          errors++;
        }
      }

      Logger.success(
        `[SupplierSync] Pricing sync complete: ${updated} updated, ${errors} errors`
      );

      return { success: true, updated, errors };
    } catch (error) {
      Logger.error(`[SupplierSync] Pricing sync failed:`, error);
      return { success: false, updated: 0, errors: 0 };
    }
  }

  /**
   * Sync catalog from supplier
   * @param supplierId - Supplier ID
   * @returns Sync result
   */
  async syncCatalog(supplierId: string): Promise<{
    success: boolean;
    newProducts: number;
    updatedProducts: number;
  }> {
    Logger.info(
      `[SupplierSync] Starting catalog sync for supplier: ${supplierId}`
    );

    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw new Error(`Supplier not found: ${supplierId}`);
      }

      const adapter = this.adapterFactory.create(supplier.type);
      const catalog = await adapter.getProductCatalog();

      Logger.debug(
        `[SupplierSync] Retrieved ${catalog.length} products from ${supplier.name}`
      );

      let newProducts = 0;
      let updatedProducts = 0;

      for (const product of catalog) {
        const existing = await SupplierVariantMapping.findOne({
          supplierId: supplierId,
          supplierSku: product.sku,
        });

        if (existing) {
          // Update existing mapping
          existing.cost = product.cost;
          existing.isAvailable = product.available;
          existing.stockQuantity = product.stockQuantity || 0;
          existing.lastSyncedAt = new Date();
          await existing.save();
          updatedProducts++;
        } else {
          // Create new mapping (requires manual SKU translation)
          Logger.info(
            `[SupplierSync] New product found: ${product.name} (${product.sku})`
          );
          newProducts++;
        }
      }

      Logger.success(
        `[SupplierSync] Catalog sync complete: ${newProducts} new, ${updatedProducts} updated`
      );

      return { success: true, newProducts, updatedProducts };
    } catch (error) {
      Logger.error(`[SupplierSync] Catalog sync failed:`, error);
      return { success: false, newProducts: 0, updatedProducts: 0 };
    }
  }

  /**
   * Handle webhook from supplier
   * @param supplierType - Supplier type (printful, customcat)
   * @param event - Webhook event
   * @param data - Webhook data
   */
  async handleWebhook(
    supplierType: string,
    event: string,
    data: any
  ): Promise<void> {
    Logger.info(`[SupplierSync] Received webhook: ${supplierType} - ${event}`);

    try {
      switch (event) {
        case "inventory_updated":
          await this.handleInventoryUpdate(supplierType, data);
          break;

        case "price_updated":
          await this.handlePriceUpdate(supplierType, data);
          break;

        case "order_status_updated":
          await this.handleOrderStatusUpdate(supplierType, data);
          break;

        default:
          Logger.warn(`[SupplierSync] Unknown webhook event: ${event}`);
      }
    } catch (error) {
      Logger.error(`[SupplierSync] Webhook handling failed:`, error);
      throw error;
    }
  }

  /**
   * Handle inventory update webhook
   */
  private async handleInventoryUpdate(
    supplierType: string,
    data: any
  ): Promise<void> {
    const { sku, available, quantity } = data;

    const mapping = await SupplierVariantMapping.findOne({
      supplierSku: sku,
    }).populate("supplierId");

    if (!mapping) {
      Logger.warn(`[SupplierSync] Mapping not found for supplier SKU: ${sku}`);
      return;
    }

    mapping.isAvailable = available;
    mapping.stockQuantity = quantity;
    mapping.lastSyncedAt = new Date();
    await mapping.save();

    Logger.success(
      `[SupplierSync] Updated inventory for ${mapping.sku}: ${
        available ? quantity : "Out of stock"
      }`
    );
  }

  /**
   * Handle price update webhook
   */
  private async handlePriceUpdate(
    supplierType: string,
    data: any
  ): Promise<void> {
    const { sku, cost } = data;

    const mapping = await SupplierVariantMapping.findOne({
      supplierSku: sku,
    });

    if (!mapping) {
      Logger.warn(`[SupplierSync] Mapping not found for supplier SKU: ${sku}`);
      return;
    }

    const oldCost = mapping.cost;
    mapping.cost = cost;
    mapping.lastSyncedAt = new Date();
    await mapping.save();

    Logger.success(
      `[SupplierSync] Updated price for ${mapping.sku}: ${oldCost} → ${cost}`
    );
  }

  /**
   * Handle order status update webhook
   */
  private async handleOrderStatusUpdate(
    supplierType: string,
    data: any
  ): Promise<void> {
    // TODO: Update production order status
    Logger.info(`[SupplierSync] Order status update: ${JSON.stringify(data)}`);
  }

  /**
   * Schedule sync jobs
   */
  setupScheduledJobs(): void {
    // Daily catalog sync at 3 AM
    cron.schedule("0 3 * * *", async () => {
      Logger.info("[SupplierSync] Running scheduled catalog sync");
      const suppliers = await Supplier.find({ isActive: true });
      for (const supplier of suppliers) {
        await this.syncCatalog(supplier._id.toString());
      }
    });

    // Hourly inventory sync
    cron.schedule("0 * * * *", async () => {
      Logger.info("[SupplierSync] Running scheduled inventory sync");
      const suppliers = await Supplier.find({ isActive: true });
      for (const supplier of suppliers) {
        await this.syncInventory(supplier._id.toString());
      }
    });

    // Daily pricing sync at 4 AM
    cron.schedule("0 4 * * *", async () => {
      Logger.info("[SupplierSync] Running scheduled pricing sync");
      const suppliers = await Supplier.find({ isActive: true });
      for (const supplier of suppliers) {
        await this.syncPricing(supplier._id.toString());
      }
    });

    Logger.info("[SupplierSync] Scheduled jobs configured");
  }
}
