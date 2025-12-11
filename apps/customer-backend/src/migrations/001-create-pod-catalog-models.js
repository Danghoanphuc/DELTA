// src/migrations/001-create-pod-catalog-models.js
// Migration: Create new collections for POD Catalog Optimization

import mongoose from "mongoose";
import { Artwork } from "../modules/artworks/artwork.model.js";
import { ProductionOrder } from "../modules/production-orders/production-order.model.js";
import { Invoice } from "../modules/invoices/invoice.model.js";
import { InventoryTransaction } from "../modules/inventory/inventory-transaction.model.js";
import { SkuVariant } from "../modules/catalog/sku-variant.model.js";

export async function up() {
  console.log("🚀 Running migration: Create POD Catalog Models");

  try {
    // 1. Create Artwork collection with indexes
    console.log("📦 Creating Artwork collection...");
    await Artwork.createCollection();
    await Artwork.createIndexes();
    console.log("✅ Artwork collection created");

    // 2. Create ProductionOrder collection with indexes
    console.log("📦 Creating ProductionOrder collection...");
    await ProductionOrder.createCollection();
    await ProductionOrder.createIndexes();
    console.log("✅ ProductionOrder collection created");

    // 3. Create Invoice collection with indexes
    console.log("📦 Creating Invoice collection...");
    await Invoice.createCollection();
    await Invoice.createIndexes();
    console.log("✅ Invoice collection created");

    // 4. Create InventoryTransaction collection with indexes
    console.log("📦 Creating InventoryTransaction collection...");
    await InventoryTransaction.createCollection();
    await InventoryTransaction.createIndexes();
    console.log("✅ InventoryTransaction collection created");

    // 5. Create SkuVariant collection with indexes
    console.log("📦 Creating SkuVariant collection...");
    await SkuVariant.createCollection();
    await SkuVariant.createIndexes();
    console.log("✅ SkuVariant collection created");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

export async function down() {
  console.log("🔄 Rolling back migration: Create POD Catalog Models");

  try {
    // Drop collections in reverse order
    await SkuVariant.collection.drop();
    console.log("✅ SkuVariant collection dropped");

    await InventoryTransaction.collection.drop();
    console.log("✅ InventoryTransaction collection dropped");

    await Invoice.collection.drop();
    console.log("✅ Invoice collection dropped");

    await ProductionOrder.collection.drop();
    console.log("✅ ProductionOrder collection dropped");

    await Artwork.collection.drop();
    console.log("✅ Artwork collection dropped");

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
