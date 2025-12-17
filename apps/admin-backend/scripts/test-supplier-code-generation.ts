// Test script for supplier code auto-generation
// Run: npx tsx apps/admin-backend/scripts/test-supplier-code-generation.ts

import mongoose from "mongoose";
import { Supplier } from "../src/models/catalog.models.js";
import { Logger } from "../src/shared/utils/logger.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag-admin";

async function testSupplierCodeGeneration() {
  try {
    await mongoose.connect(MONGODB_URI);
    Logger.info("Connected to MongoDB");

    // Test 1: Check existing suppliers
    const existingSuppliers = await Supplier.find().select("code type name");
    Logger.info(`Found ${existingSuppliers.length} existing suppliers:`);
    existingSuppliers.forEach((s) => {
      console.log(`  - ${s.code} (${s.type}): ${s.name}`);
    });

    // Test 2: Generate codes for each type
    const types = [
      "manufacturer",
      "distributor",
      "printer",
      "dropshipper",
      "artisan",
    ];

    Logger.info("\nGenerating next codes for each type:");
    for (const type of types) {
      const prefix =
        {
          manufacturer: "MFR",
          distributor: "DST",
          printer: "PRT",
          dropshipper: "DRP",
          artisan: "ART",
        }[type] || "SUP";

      const lastSupplier = await Supplier.findOne({
        code: new RegExp(`^${prefix}`),
      })
        .sort({ code: -1 })
        .lean();

      let nextNumber = 1;
      if (lastSupplier?.code) {
        const match = lastSupplier.code.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }

      const nextCode = `${prefix}-${nextNumber.toString().padStart(4, "0")}`;
      console.log(
        `  ${type}: ${nextCode} (last: ${lastSupplier?.code || "none"})`
      );
    }

    Logger.success("\nTest completed successfully!");
  } catch (error) {
    Logger.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testSupplierCodeGeneration();
