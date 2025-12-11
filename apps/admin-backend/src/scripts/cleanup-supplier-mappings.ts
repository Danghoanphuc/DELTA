/**
 * Cleanup Script: Remove supplierMappings field
 *
 * Removes the old supplierMappings embedded array from SkuVariant collection
 * Run ONLY after migration is verified and tested
 *
 * Run: npx ts-node src/scripts/cleanup-supplier-mappings.ts
 */

import mongoose from "mongoose";
import { SkuVariant } from "../models/sku-variant.model.js";
import { Logger } from "../shared/utils/logger.util.js";
import * as readline from "readline";

async function promptConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\n⚠️  WARNING: This will permanently remove supplierMappings field from all SkuVariant documents.\n" +
        "Have you:\n" +
        "  1. Verified the migration was successful?\n" +
        "  2. Tested the application with the new SupplierVariantMapping collection?\n" +
        "  3. Backed up your database?\n\n" +
        "Type 'YES' to proceed: ",
      (answer) => {
        rl.close();
        resolve(answer.trim() === "YES");
      }
    );
  });
}

async function cleanupSupplierMappings() {
  try {
    Logger.info("[Cleanup] Starting supplier mappings cleanup...");

    // Prompt for confirmation
    const confirmed = await promptConfirmation();

    if (!confirmed) {
      Logger.warn("[Cleanup] Cleanup cancelled by user");
      process.exit(0);
    }

    // Connect to database
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";
    await mongoose.connect(mongoUri);
    Logger.success("[Cleanup] Connected to database");

    // Count documents with supplierMappings field
    const countBefore = await SkuVariant.countDocuments({
      supplierMappings: { $exists: true },
    });

    Logger.info(
      `[Cleanup] Found ${countBefore} variants with supplierMappings field`
    );

    if (countBefore === 0) {
      Logger.info("[Cleanup] No documents to clean up");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Remove supplierMappings field
    Logger.info("[Cleanup] Removing supplierMappings field...");

    const result = await SkuVariant.updateMany(
      { supplierMappings: { $exists: true } },
      { $unset: { supplierMappings: "" } }
    );

    Logger.success(`[Cleanup] Updated ${result.modifiedCount} documents`);

    // Verify cleanup
    const countAfter = await SkuVariant.countDocuments({
      supplierMappings: { $exists: true },
    });

    if (countAfter === 0) {
      Logger.success(
        "[Cleanup] All supplierMappings fields removed successfully"
      );
    } else {
      Logger.warn(
        `[Cleanup] ${countAfter} documents still have supplierMappings field`
      );
    }

    // Check collection stats
    const stats = await SkuVariant.collection.stats();
    Logger.info("[Cleanup] Collection stats:");
    Logger.info(`  - Document count: ${stats.count}`);
    Logger.info(
      `  - Average document size: ${Math.round(stats.avgObjSize)} bytes`
    );
    Logger.info(`  - Total size: ${Math.round(stats.size / 1024 / 1024)} MB`);

    await mongoose.disconnect();
    Logger.success("[Cleanup] Disconnected from database");
    Logger.success("[Cleanup] Cleanup completed successfully!");
  } catch (error) {
    Logger.error("[Cleanup] Cleanup failed:", error);
    process.exit(1);
  }
}

// Run cleanup
cleanupSupplierMappings()
  .then(() => {
    Logger.success("[Cleanup] Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    Logger.error("[Cleanup] Script failed:", error);
    process.exit(1);
  });
