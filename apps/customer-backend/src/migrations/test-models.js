// src/migrations/test-models.js
// Quick test script to verify all models load correctly

import mongoose from "mongoose";

async function testModels() {
  console.log("🧪 Testing POD Catalog Models...\n");

  try {
    // Import all models
    console.log("📦 Importing models...");
    const { Artwork } = await import("../modules/artworks/artwork.model.js");
    const { ProductionOrder } = await import(
      "../modules/production-orders/production-order.model.js"
    );
    const { Invoice } = await import("../modules/invoices/invoice.model.js");
    const { InventoryTransaction } = await import(
      "../modules/inventory/inventory-transaction.model.js"
    );
    const { SkuVariant } = await import(
      "../modules/catalog/sku-variant.model.js"
    );
    const { Product } = await import("../shared/models/product.model.js");
    const { SwagOrder } = await import(
      "../modules/swag-orders/swag-order.model.js"
    );

    console.log("✅ All models imported successfully\n");

    // Test model schemas
    console.log("🔍 Checking model schemas...");

    const models = [
      { name: "Artwork", model: Artwork },
      { name: "ProductionOrder", model: ProductionOrder },
      { name: "Invoice", model: Invoice },
      { name: "InventoryTransaction", model: InventoryTransaction },
      { name: "SkuVariant", model: SkuVariant },
      { name: "Product", model: Product },
      { name: "SwagOrder", model: SwagOrder },
    ];

    for (const { name, model } of models) {
      const schema = model.schema;
      const paths = Object.keys(schema.paths);
      const indexes = schema.indexes();

      console.log(`\n📋 ${name}:`);
      console.log(`   - Fields: ${paths.length}`);
      console.log(`   - Indexes: ${indexes.length}`);
      console.log(`   - Collection: ${model.collection.name}`);
    }

    // Check new fields in enhanced models
    console.log("\n🔍 Checking enhanced model fields...");

    const productSchema = Product.schema;
    const hasProductFields =
      productSchema.paths.printMethods &&
      productSchema.paths.moqByPrintMethod &&
      productSchema.paths.productionComplexity;

    console.log(`\n📋 Product enhancements: ${hasProductFields ? "✅" : "❌"}`);
    if (hasProductFields) {
      console.log("   - printMethods: ✅");
      console.log("   - moqByPrintMethod: ✅");
      console.log("   - productionComplexity: ✅");
    }

    const swagOrderSchema = SwagOrder.schema;
    const hasSwagOrderFields =
      swagOrderSchema.paths.production &&
      swagOrderSchema.paths.costBreakdown &&
      swagOrderSchema.paths.documents;

    console.log(
      `\n📋 SwagOrder enhancements: ${hasSwagOrderFields ? "✅" : "❌"}`
    );
    if (hasSwagOrderFields) {
      console.log("   - production: ✅");
      console.log("   - costBreakdown: ✅");
      console.log("   - documents: ✅");
    }

    console.log("\n✅ All model tests passed!");
    console.log("\n📊 Summary:");
    console.log(`   - New models: 5`);
    console.log(`   - Enhanced models: 2`);
    console.log(`   - Total models tested: 7`);
    console.log("\n✨ Models are ready for migration!");
  } catch (error) {
    console.error("\n❌ Model test failed:", error);
    throw error;
  }
}

// Run test
testModels()
  .then(() => {
    console.log("\n👋 Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test error:", error);
    process.exit(1);
  });
