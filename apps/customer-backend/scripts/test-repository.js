// Test repository
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { productRepository } from "../src/modules/products/product.repository.js";

async function testRepository() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected\n");

    // Test 1: Find all
    console.log("Test 1: Find all products");
    const all = await productRepository.find({});
    console.log(`   Found: ${all.length} products\n`);

    // Test 2: Find with filter
    console.log("Test 2: Find with filter { isDraft: false, isActive: true }");
    const filtered = await productRepository.find({
      isDraft: false,
      isActive: true,
    });
    console.log(`   Found: ${filtered.length} products`);
    filtered.forEach((p) => console.log(`   - ${p.name}`));
    console.log("");

    // Test 3: Find with pagination
    console.log("Test 3: Find with pagination");
    const paginated = await productRepository.find(
      { isDraft: false, isActive: true },
      { page: 1, limit: 10 }
    );
    console.log(`   Found: ${paginated.length} products`);
    paginated.forEach((p) => console.log(`   - ${p.name}`));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testRepository();
