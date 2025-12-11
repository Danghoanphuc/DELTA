// apps/admin-backend/src/scripts/check-categories.ts
import mongoose from "mongoose";
import { ProductCategory } from "../models/catalog.models.js";
import dotenv from "dotenv";

dotenv.config();

async function checkCategories() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const count = await ProductCategory.countDocuments();
    console.log(`\nTotal categories: ${count}`);

    if (count > 0) {
      const cats = await ProductCategory.find().sort({ sortOrder: 1 }).lean();
      console.log("\nCategories:");
      cats.forEach((cat) => {
        console.log(`  - ${cat.name} (${cat._id}) - ${cat.path}`);
      });
    } else {
      console.log("\n⚠️  No categories found! Run seed script first.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCategories();
