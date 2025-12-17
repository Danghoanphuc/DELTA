// Check products in database
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { Product } from "../src/shared/models/product.model.js";

async function checkProducts() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    await mongoose.connect(mongoUri);

    const products = await Product.find({})
      .select("name isActive isDraft category slug")
      .lean();

    console.log("\n📦 Products in database:\n");
    console.log("Total:", products.length);
    console.log("\n" + "=".repeat(70));

    products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   isActive: ${p.isActive}`);
      console.log(`   isDraft: ${p.isDraft}`);
      console.log(`   Slug: ${p.slug}`);
    });

    console.log("\n" + "=".repeat(70));

    // Check filter
    const publicProducts = await Product.find({
      isDraft: false,
      isActive: true,
    })
      .select("name")
      .lean();

    console.log(
      `\n✅ Public products (isDraft: false, isActive: true): ${publicProducts.length}`
    );
    publicProducts.forEach((p) => console.log(`   - ${p.name}`));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkProducts();
