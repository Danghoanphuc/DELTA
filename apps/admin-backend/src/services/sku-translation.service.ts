// @ts-nocheck
/**
 * SKU Translation Service
 *
 * Translates between internal SKUs and supplier SKUs
 * Uses SupplierVariantMapping collection for lookups
 */

import {
  SupplierVariantMapping,
  ISupplierVariantMapping,
} from "../models/supplier-variant-mapping.model.js";
import { Logger } from "../shared/utils/logger.js";
import { NotFoundException } from "../shared/exceptions/index.js";

export class SkuTranslationService {
  /**
   * Translate internal SKU to supplier SKU
   * @param internalSku - Our internal SKU (e.g., "TSHIRT-001-BLK-M")
   * @param supplierId - Target supplier ID
   * @returns Supplier's SKU (e.g., "PRINTFUL-12345-BLK-M") or null if not found
   */
  async translateToSupplier(
    internalSku: string,
    supplierId: string
  ): Promise<string | null> {
    try {
      Logger.debug(
        `[SkuTranslationSvc] Translating ${internalSku} to supplier ${supplierId}`
      );

      const mapping = await SupplierVariantMapping.findOne({
        sku: internalSku,
        supplierId: supplierId,
        isAvailable: true,
        syncStatus: "active",
      }).lean();

      if (!mapping) {
        Logger.warn(
          `[SkuTranslationSvc] No mapping found for ${internalSku} + supplier ${supplierId}`
        );
        return null;
      }

      Logger.debug(
        `[SkuTranslationSvc] Translated ${internalSku} → ${mapping.supplierSku}`
      );

      return mapping.supplierSku;
    } catch (error) {
      Logger.error(
        `[SkuTranslationSvc] Error translating ${internalSku}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Reverse lookup: Find internal SKU from supplier SKU
   * @param supplierSku - Supplier's SKU
   * @param supplierId - Supplier ID
   * @returns Our internal SKU or null if not found
   */
  async translateFromSupplier(
    supplierSku: string,
    supplierId: string
  ): Promise<string | null> {
    try {
      Logger.debug(
        `[SkuTranslationSvc] Reverse lookup: ${supplierSku} from supplier ${supplierId}`
      );

      const mapping = await SupplierVariantMapping.findOne({
        supplierSku: supplierSku,
        supplierId: supplierId,
      }).lean();

      if (!mapping) {
        Logger.warn(
          `[SkuTranslationSvc] No mapping found for supplier SKU ${supplierSku}`
        );
        return null;
      }

      Logger.debug(
        `[SkuTranslationSvc] Reverse translated ${supplierSku} → ${mapping.sku}`
      );

      return mapping.sku;
    } catch (error) {
      Logger.error(
        `[SkuTranslationSvc] Error reverse translating ${supplierSku}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all supplier options for a SKU
   * @param internalSku - Our internal SKU
   * @returns List of supplier mappings
   */
  async getSupplierOptions(
    internalSku: string
  ): Promise<ISupplierVariantMapping[]> {
    try {
      Logger.debug(
        `[SkuTranslationSvc] Getting supplier options for ${internalSku}`
      );

      const mappings = await SupplierVariantMapping.find({
        sku: internalSku,
        isAvailable: true,
        syncStatus: "active",
      })
        .populate("supplierId", "name type")
        .lean();

      Logger.debug(
        `[SkuTranslationSvc] Found ${mappings.length} supplier options for ${internalSku}`
      );

      return mappings as ISupplierVariantMapping[];
    } catch (error) {
      Logger.error(
        `[SkuTranslationSvc] Error getting supplier options for ${internalSku}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Bulk translate for order items
   * @param items - Order items with internal SKUs
   * @param supplierId - Target supplier
   * @returns Map of internal SKU → supplier SKU
   */
  async bulkTranslate(
    items: Array<{ sku: string; quantity: number }>,
    supplierId: string
  ): Promise<Map<string, string>> {
    try {
      const skus = items.map((item) => item.sku);

      Logger.debug(
        `[SkuTranslationSvc] Bulk translating ${skus.length} SKUs for supplier ${supplierId}`
      );

      const mappings = await SupplierVariantMapping.find({
        sku: { $in: skus },
        supplierId: supplierId,
        isAvailable: true,
        syncStatus: "active",
      }).lean();

      const translationMap = new Map<string, string>();
      mappings.forEach((m) => translationMap.set(m.sku, m.supplierSku));

      Logger.debug(
        `[SkuTranslationSvc] Translated ${translationMap.size}/${skus.length} SKUs`
      );

      // Log missing translations
      const missingSkus = skus.filter((sku) => !translationMap.has(sku));
      if (missingSkus.length > 0) {
        Logger.warn(
          `[SkuTranslationSvc] Missing translations for: ${missingSkus.join(
            ", "
          )}`
        );
      }

      return translationMap;
    } catch (error) {
      Logger.error(`[SkuTranslationSvc] Error bulk translating:`, error);
      throw error;
    }
  }

  /**
   * Get mapping by SKU and supplier
   * @param internalSku - Internal SKU
   * @param supplierId - Supplier ID
   * @returns Supplier variant mapping
   * @throws NotFoundException if mapping not found
   */
  async getMapping(
    internalSku: string,
    supplierId: string
  ): Promise<ISupplierVariantMapping> {
    const mapping = await SupplierVariantMapping.findOne({
      sku: internalSku,
      supplierId: supplierId,
    })
      .populate("supplierId", "name type")
      .lean();

    if (!mapping) {
      throw new NotFoundException(
        "Supplier Variant Mapping",
        `${internalSku} + ${supplierId}`
      );
    }

    return mapping as ISupplierVariantMapping;
  }

  /**
   * Update mapping availability
   * @param internalSku - Internal SKU
   * @param supplierId - Supplier ID
   * @param isAvailable - Availability status
   * @param stockQuantity - Stock quantity (optional)
   */
  async updateAvailability(
    internalSku: string,
    supplierId: string,
    isAvailable: boolean,
    stockQuantity?: number
  ): Promise<void> {
    try {
      const updateData: any = {
        isAvailable,
        lastSyncedAt: new Date(),
      };

      if (stockQuantity !== undefined) {
        updateData.stockQuantity = stockQuantity;
      }

      await SupplierVariantMapping.updateOne(
        {
          sku: internalSku,
          supplierId: supplierId,
        },
        { $set: updateData }
      );

      Logger.debug(
        `[SkuTranslationSvc] Updated availability for ${internalSku} + supplier ${supplierId}: ${isAvailable}`
      );
    } catch (error) {
      Logger.error(`[SkuTranslationSvc] Error updating availability:`, error);
      throw error;
    }
  }

  /**
   * Update mapping cost
   * @param internalSku - Internal SKU
   * @param supplierId - Supplier ID
   * @param cost - New cost
   */
  async updateCost(
    internalSku: string,
    supplierId: string,
    cost: number
  ): Promise<void> {
    try {
      await SupplierVariantMapping.updateOne(
        {
          sku: internalSku,
          supplierId: supplierId,
        },
        {
          $set: {
            cost,
            lastSyncedAt: new Date(),
          },
        }
      );

      Logger.debug(
        `[SkuTranslationSvc] Updated cost for ${internalSku} + supplier ${supplierId}: ${cost}`
      );
    } catch (error) {
      Logger.error(`[SkuTranslationSvc] Error updating cost:`, error);
      throw error;
    }
  }
}
