// apps/admin-backend/src/scripts/seed-categories.ts
// ✅ Seed default product categories

import mongoose from "mongoose";
import { ProductCategory } from "../models/catalog.models.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const categories = [
  {
    name: "Apparel",
    slug: "apparel",
    description: "Quần áo và phụ kiện thời trang",
    path: "apparel",
    level: 0,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Drinkware",
    slug: "drinkware",
    description: "Ly, cốc, bình nước",
    path: "drinkware",
    level: 0,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Túi xách, ba lô, túi vải",
    path: "bags",
    level: 0,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Tech Accessories",
    slug: "tech-accessories",
    description: "Phụ kiện công nghệ",
    path: "tech-accessories",
    level: 0,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Stationery",
    slug: "stationery",
    description: "Văn phòng phẩm",
    path: "stationery",
    level: 0,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Đồ gia dụng và trang trí",
    path: "home-living",
    level: 0,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Other",
    slug: "other",
    description: "Sản phẩm khác",
    path: "other",
    level: 0,
    isActive: true,
    sortOrder: 99,
  },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if categories already exist
    const existingCount = await ProductCategory.countDocuments();
    if (existingCount > 0) {
      console.log(
        `ℹ️  Found ${existingCount} existing categories. Skipping seed.`
      );
      process.exit(0);
    }

    // Insert categories
    const result = await ProductCategory.insertMany(categories);
    console.log(`✅ Seeded ${result.length} categories successfully!`);

    // Display created categories
    console.log("\nCreated categories:");
    result.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
