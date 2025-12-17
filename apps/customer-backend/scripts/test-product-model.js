// Test Product model directly
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { Product } from "../src/shared/models/product.model.js";

async function testModel() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected\n");

    // Test 1: Find all
    console.log("Test 1: Product.find({})");
    const all = await Product.find({}).lean();
    console.log(`   Found: ${all.length} products\n`);

    // Test 2: Find with filter
    console.log("Test 2: Product.find({ isActive: true, isDraft: false })");
    const filtered = await Product.find({
      isActive: true,
      isDraft: false,
    }).lean();
    console.log(`   Found: ${filtered.length} products`);
    filtered.forEach((p) => console.log(`   - ${p.name}`));
    console.log("");

    // Test 3: With sort and limit
    console.log("Test 3: With sort and limit");
    const sorted = await Product.find({ isActive: true, isDraft: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    console.log(`   Found: ${sorted.length} products`);
    sorted.forEach((p) => console.log(`   - ${p.name}`));
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testModel();
