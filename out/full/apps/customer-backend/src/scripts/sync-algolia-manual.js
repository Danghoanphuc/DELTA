// apps/customer-backend/src/scripts/sync-algolia-manual.js
// ✅ Script đồng bộ sản phẩm từ MongoDB lên Algolia (Chạy 1 lần)

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { algoliaService } from "../infrastructure/search/algolia.service.js";
import { Product } from "../shared/models/product.model.js";

// Load env từ file .env gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const sync = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    if (!process.env.MONGODB_CONNECTIONSTRING) {
      throw new Error("Missing MONGODB_CONNECTIONSTRING");
    }

    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("✅ Connected to MongoDB.");

    console.log("📦 Fetching products...");
    const products = await Product.find({ isActive: true }).lean();
    console.log(`Found ${products.length} active products.`);

    if (products.length === 0) {
      console.log("⚠️ No products to sync. Exiting...");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("🚀 Syncing to Algolia...");
    let count = 0;
    let successCount = 0;
    let errorCount = 0;

    // Loop qua từng sản phẩm và sync
    for (const p of products) {
      try {
        // Giả lập object giống service
        const productDoc = {
          ...p,
          pricing: p.pricing || [],
          images: p.images || [],
        };

        await algoliaService.syncProduct(productDoc);
        successCount++;
        count++;
        process.stdout.write(`\rProgress: ${count}/${products.length} (✅ ${successCount} | ❌ ${errorCount})`);
      } catch (error) {
        errorCount++;
        count++;
        console.error(`\n❌ Error syncing product ${p._id}:`, error.message);
        process.stdout.write(`\rProgress: ${count}/${products.length} (✅ ${successCount} | ❌ ${errorCount})`);
      }
    }

    console.log("\n✅ Sync Complete!");
    console.log(`📊 Summary: ${successCount} succeeded, ${errorCount} failed`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("\n❌ Error:", e);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

sync();

