// src/migrations/002-enhance-existing-models.js
// Migration: Add new fields to existing Product, SwagOrder models

import mongoose from "mongoose";
import { Product } from "../shared/models/product.model.js";
import { SwagOrder } from "../modules/swag-orders/swag-order.model.js";

export async function up() {
  console.log("🚀 Running migration: Enhance Existing Models");

  try {
    // 1. Enhance Product Model
    console.log("📦 Enhancing Product model...");
    const productUpdateResult = await Product.updateMany(
      {
        $or: [
          { printMethods: { $exists: false } },
          { moqByPrintMethod: { $exists: false } },
          { productionComplexity: { $exists: false } },
        ],
      },
      {
        $set: {
          printMethods: [],
          moqByPrintMethod: [],
          productionComplexity: {
            score: 5,
            factors: [],
          },
        },
      }
    );
    console.log(
      `✅ Updated ${productUpdateResult.modifiedCount} products with new fields`
    );

    // 2. Enhance SwagOrder Model
    console.log("📦 Enhancing SwagOrder model...");
    const swagOrderUpdateResult = await SwagOrder.updateMany(
      {
        $or: [
          { production: { $exists: false } },
          { costBreakdown: { $exists: false } },
          { documents: { $exists: false } },
        ],
      },
      {
        $set: {
          production: {
            productionOrders: [],
            status: "pending",
            kittingStatus: "pending",
            qcRequired: false,
            qcStatus: "pending",
            qcPhotos: [],
          },
          costBreakdown: {
            baseProductsCost: 0,
            customizationCost: 0,
            setupFees: 0,
            kittingFee: 0,
            packagingCost: 0,
            shippingCost: 0,
            handlingFee: 0,
            totalCost: 0,
            totalPrice: 0,
            grossMargin: 0,
            marginPercentage: 0,
          },
          documents: {
            packingSlips: [],
            deliveryNotes: [],
          },
        },
      }
    );
    console.log(
      `✅ Updated ${swagOrderUpdateResult.modifiedCount} swag orders with new fields`
    );

    // 3. Validate data integrity
    console.log("🔍 Validating data integrity...");
    const productsCount = await Product.countDocuments({
      printMethods: { $exists: true },
    });
    const ordersCount = await SwagOrder.countDocuments({
      production: { $exists: true },
    });
    console.log(`✅ Validated ${productsCount} products`);
    console.log(`✅ Validated ${ordersCount} swag orders`);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

export async function down() {
  console.log("🔄 Rolling back migration: Enhance Existing Models");

  try {
    // 1. Remove new fields from Product
    console.log("📦 Removing new fields from Product model...");
    await Product.updateMany(
      {},
      {
        $unset: {
          printMethods: "",
          moqByPrintMethod: "",
          productionComplexity: "",
        },
      }
    );
    console.log("✅ Removed new fields from Product model");

    // 2. Remove new fields from SwagOrder
    console.log("📦 Removing new fields from SwagOrder model...");
    await SwagOrder.updateMany(
      {},
      {
        $unset: {
          production: "",
          costBreakdown: "",
          documents: "",
        },
      }
    );
    console.log("✅ Removed new fields from SwagOrder model");

    console.log("✅ Rollback completed successfully!");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";

  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log("📡 Connected to MongoDB");
      await up();
      await mongoose.disconnect();
      console.log("👋 Disconnected from MongoDB");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration error:", error);
      process.exit(1);
    });
}
