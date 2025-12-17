// Test direct query in same context as service
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { Product } from "../src/shared/models/product.model.js";

async function testDirectQuery() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("\n=== TEST 1: Find all products ===");
    const allProducts = await Product.find({}).lean();
    console.log("Total products:", allProducts.length);

    console.log("\n=== TEST 2: Find with exact filter from service ===");
    const productFilter = {
      isDraft: false,
      isActive: true,
    };
    console.log("Filter:", JSON.stringify(productFilter));

    const filteredProducts = await Product.find(productFilter).lean();
    console.log("Filtered products:", filteredProducts.length);

    if (filteredProducts.length > 0) {
      console.log("\n✅ Products found:");
      filteredProducts.forEach((p) => {
        console.log(`  - ${p.name}`);
        console.log(`    isDraft: ${p.isDraft}, isActive: ${p.isActive}`);
      });
    } else {
      console.log("\n❌ No products found with filter");

      console.log("\n=== TEST 3: Check individual fields ===");
      const products = await Product.find({}).lean();
      products.forEach((p) => {
        console.log(`\nProduct: ${p.name}`);
        console.log(`  isDraft: ${p.isDraft} (type: ${typeof p.isDraft})`);
        console.log(`  isActive: ${p.isActive} (type: ${typeof p.isActive})`);
        console.log(
          `  Matches filter: ${p.isDraft === false && p.isActive === true}`
        );
      });
    }

    console.log("\n=== TEST 4: Try different query approaches ===");

    // Approach 1: Explicit boolean
    const test1 = await Product.find({
      isDraft: false,
      isActive: true,
    }).lean();
    console.log("Approach 1 (explicit boolean):", test1.length);

    // Approach 2: Using $eq
    const test2 = await Product.find({
      isDraft: { $eq: false },
      isActive: { $eq: true },
    }).lean();
    console.log("Approach 2 ($eq operator):", test2.length);

    // Approach 3: Using $ne
    const test3 = await Product.find({
      isDraft: { $ne: true },
      isActive: { $ne: false },
    }).lean();
    console.log("Approach 3 ($ne operator):", test3.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testDirectQuery();
