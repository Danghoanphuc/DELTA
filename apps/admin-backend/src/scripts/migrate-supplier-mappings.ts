/**
 * Migration Script: Supplier Mappings
 *
 * Migrates supplierMappings from embedded array in SkuVariant
 * to separate SupplierVariantMapping collection
 *
 * Run: npx ts-node src/scripts/migrate-supplier-mappings.ts
 */

import mongoose from "mongoose";
import { SkuVariant } from "../models/sku-variant.model.js";
import { SupplierVariantMapping } from "../models/supplier-variant-mapping.model.js";
import { Logger } from "../shared/utils/logger.js";

async function migrateSupplierMappings() {
  try {
    Logger.info("[Migration] Starting supplier mappings migration...");

    // Connect to database
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";
    await mongoose.connect(mongoUri);
    Logger.success("[Migration] Connected to database");

    // Get all SKU variants with supplier mappings
    const variants = await SkuVariant.find({
      supplierMappings: { $exists: true, $ne: [] },
    });

    Logger.info(
      `[Migration] Found ${variants.length} variants with supplier mappings`
    );

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const variant of variants) {
      if (!variant.supplierMappings || variant.supplierMappings.length === 0) {
        continue;
      }

      Logger.debug(`[Migration] Processing variant: ${variant.sku}`);

      for (const mapping of variant.supplierMappings) {
        try {
          // Check if mapping already exists
          const existing = await SupplierVariantMapping.findOne({
            skuVariantId: variant._id,
            supplierId: mapping.supplierId,
          });

          if (existing) {
            Logger.debug(
              `[Migration] Mapping already exists for ${variant.sku} + supplier ${mapping.supplierId}`
            );
            skippedCount++;
            continue;
          }

          // Create new mapping
          await SupplierVariantMapping.create({
            skuVariantId: variant._id,
            sku: variant.sku,
            supplierId: mapping.supplierId,
            supplierSku: mapping.supplierSku,
            cost: mapping.cost,
            stockQuantity: 999, // Default, will be synced from supplier
            isAvailable: true,
            leadTime: mapping.leadTime,
            moq: mapping.moq || 1,
            isPreferred: mapping.isPreferred || false,
            priority: mapping.isPreferred ? 1 : 2,
            syncStatus: "active",
            lastSyncedAt: new Date(),
          });

          migratedCount++;
          Logger.debug(
            `[Migration] Created mapping for ${variant.sku} → ${mapping.supplierSku}`
          );
        } catch (error: any) {
          errorCount++;
          Logger.error(
            `[Migration] Error creating mapping for ${variant.sku}:`,
            error.message
          );
        }
      }
    }

    Logger.success("[Migration] Migration completed!");
    Logger.info(`[Migration] Stats:`);
    Logger.info(`  - Migrated: ${migratedCount}`);
    Logger.info(`  - Skipped (already exists): ${skippedCount}`);
    Logger.info(`  - Errors: ${errorCount}`);

    // Validate data integrity
    Logger.info("[Migration] Validating data integrity...");

    const totalMappings = await SupplierVariantMapping.countDocuments();
    Logger.info(
      `[Migration] Total mappings in new collection: ${totalMappings}`
    );

    // Check for duplicates
    const duplicates = await SupplierVariantMapping.aggregate([
      {
        $group: {
          _id: { skuVariantId: "$skuVariantId", supplierId: "$supplierId" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicates.length > 0) {
      Logger.warn(`[Migration] Found ${duplicates.length} duplicate mappings!`);
      Logger.warn("[Migration] Duplicates:", duplicates);
    } else {
      Logger.success("[Migration] No duplicates found");
    }

    // Verify indexes
    const indexes = await SupplierVariantMapping.collection.getIndexes();
    Logger.info("[Migration] Indexes created:");
    Object.keys(indexes).forEach((indexName) => {
      Logger.info(`  - ${indexName}`);
    });

    Logger.success("[Migration] Validation completed!");
    Logger.info("[Migration] Next steps:");
    Logger.info("  1. Review migration results");
    Logger.info("  2. Test application with new collection");
    Logger.info(
      "  3. Once verified, remove supplierMappings field from SkuVariant schema"
    );
    Logger.info("  4. Run cleanup script to remove old field from database");

    await mongoose.disconnect();
    Logger.success("[Migration] Disconnected from database");
  } catch (error) {
    Logger.error("[Migration] Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateSupplierMappings()
  .then(() => {
    Logger.success("[Migration] Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    Logger.error("[Migration] Script failed:", error);
    process.exit(1);
  });
