// apps/admin-backend/src/scripts/seed-categories.ts
// ✅ Seed default product categories

import mongoose from "mongoose";
import { ProductCategory } from "../models/catalog.models.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ngũ Hành Categories (Delta Swag)
const nguHanhCategories = [
  {
    name: "Hành Kim",
    slug: "hanh-kim",
    description: "Chuông Đồng, Khánh Đồng, Lư Đồng - Đồng & Kim Loại",
    path: "hanh-kim",
    level: 0,
    icon: "💎",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Hành Mộc",
    slug: "hanh-moc",
    description: "Mô Hình Thuyền Gỗ, Nón Lá, Khay Mây Tre Đan - Gỗ & Tre",
    path: "hanh-moc",
    level: 0,
    icon: "🍃",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Hành Thủy",
    slug: "hanh-thuy",
    description: "Sơn Mài, Vẽ Trong Chai, Tranh Cẩn Ốc - Sơn Mài & Thủy Tinh",
    path: "hanh-thuy",
    level: 0,
    icon: "🌊",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Hành Hỏa",
    slug: "hanh-hoa",
    description: "Trầm Hương, Gốm Men Hỏa Biến, Đèn Gốm - Trầm & Gốm Hỏa Biến",
    path: "hanh-hoa",
    level: 0,
    icon: "🔥",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Hành Thổ",
    slug: "hanh-tho",
    description: "Gốm Biên Hòa, Điêu Khắc Đá, Lu Sành - Gốm Sứ & Đá",
    path: "hanh-tho",
    level: 0,
    icon: "🏔️",
    isActive: true,
    sortOrder: 5,
  },
];

// Legacy SwagUp-style categories
const legacyCategories = [
  {
    name: "Apparel",
    slug: "apparel",
    description: "Quần áo và phụ kiện thời trang",
    path: "apparel",
    level: 0,
    isActive: true,
    sortOrder: 10,
  },
  {
    name: "Drinkware",
    slug: "drinkware",
    description: "Ly, cốc, bình nước",
    path: "drinkware",
    level: 0,
    isActive: true,
    sortOrder: 11,
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Túi xách, ba lô, túi vải",
    path: "bags",
    level: 0,
    isActive: true,
    sortOrder: 12,
  },
  {
    name: "Tech Accessories",
    slug: "tech-accessories",
    description: "Phụ kiện công nghệ",
    path: "tech-accessories",
    level: 0,
    isActive: true,
    sortOrder: 13,
  },
  {
    name: "Stationery",
    slug: "stationery",
    description: "Văn phòng phẩm",
    path: "stationery",
    level: 0,
    isActive: true,
    sortOrder: 14,
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Đồ gia dụng và trang trí",
    path: "home-living",
    level: 0,
    isActive: true,
    sortOrder: 15,
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

const categories = [...nguHanhCategories, ...legacyCategories];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/delta-swag";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB:", mongoUri.substring(0, 50) + "...");

    // Check if ALL Ngũ Hành categories exist
    const nguHanhSlugs = [
      "hanh-kim",
      "hanh-moc",
      "hanh-thuy",
      "hanh-hoa",
      "hanh-tho",
    ];
    const existingNguHanh = await ProductCategory.find({
      slug: { $in: nguHanhSlugs },
    });

    console.log(
      `ℹ️  Found ${existingNguHanh.length}/${nguHanhSlugs.length} Ngũ Hành categories.`
    );
    if (existingNguHanh.length > 0) {
      console.log(
        "   Existing:",
        existingNguHanh.map((c) => c.slug).join(", ")
      );
    }

    // Always upsert to ensure all categories exist
    console.log("ℹ️  Will upsert all categories...");

    // Check for legacy categories
    const existingCount = await ProductCategory.countDocuments();
    console.log(`ℹ️  Found ${existingCount} existing categories.`);

    // Insert categories (upsert to avoid duplicates)
    for (const cat of categories) {
      await ProductCategory.findOneAndUpdate({ slug: cat.slug }, cat, {
        upsert: true,
        new: true,
      });
    }
    console.log(`✅ Seeded ${categories.length} categories successfully!`);
    const result = await ProductCategory.find({}).lean();

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
