// apps/customer-backend/scripts/seed-mock-products.js
// Script để seed mock products vào database để test

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

// Import models
import { Product } from "../src/shared/models/product.model.js";
import { PrinterProfile } from "../src/shared/models/printer-profile.model.js";

// Đọc mock data
const mockDataPath = join(__dirname, "../../../mock-products.json");
const mockData = JSON.parse(readFileSync(mockDataPath, "utf-8"));

async function seedMockProducts() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    console.log(`   Using: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // 1. Tạo hoặc lấy printer profiles
    console.log("\n📝 Creating/Getting printer profiles...");
    const printerProfiles = {};

    for (const product of mockData.products) {
      const printerInfo = product.printerInfo;

      // Kiểm tra printer đã tồn tại chưa
      let printer = await PrinterProfile.findOne({
        businessName: printerInfo.businessName,
      });

      if (!printer) {
        // Tạo printer mới
        printer = await PrinterProfile.create({
          businessName: printerInfo.businessName,
          avatarUrl: printerInfo.avatarUrl,
          tier: printerInfo.tier,
          isVerified: true,
          isActive: true,
          contactInfo: {
            email: `${printerInfo.businessName
              .toLowerCase()
              .replace(/\s+/g, "")}@example.com`,
            phone: "0865726848",
            address: printerInfo.location,
          },
          description: `Nhà in chuyên nghiệp với ${printerInfo.totalProducts} sản phẩm`,
        });
        console.log(`   ✅ Created printer: ${printer.businessName}`);
      } else {
        console.log(`   ℹ️  Printer exists: ${printer.businessName}`);
      }

      printerProfiles[printerInfo._id] = printer._id;
    }

    // 2. Seed products
    console.log("\n📦 Seeding products...");
    let createdCount = 0;
    let updatedCount = 0;

    for (const productData of mockData.products) {
      // Kiểm tra product đã tồn tại chưa (theo slug)
      const existingProduct = await Product.findOne({ slug: productData.slug });

      // Chuẩn bị data
      const productPayload = {
        name: productData.name,
        slug: productData.slug,
        category: productData.category,
        description: productData.description,
        images: productData.images,
        pricing: productData.pricing,
        specifications: productData.specifications,
        customization: productData.customization,
        isActive: productData.isActive,
        isDraft: productData.isDraft,
        stock: productData.stock,
        totalSold: productData.totalSold,
        views: productData.views,
        rating: productData.rating,
        totalReviews: productData.totalReviews,
        printerProfileId: printerProfiles[productData.printerInfo._id],
        tags: productData.tags,
      };

      if (existingProduct) {
        // Update existing product
        await Product.findByIdAndUpdate(existingProduct._id, productPayload);
        console.log(`   🔄 Updated: ${productData.name}`);
        updatedCount++;
      } else {
        // Create new product
        await Product.create(productPayload);
        console.log(`   ✅ Created: ${productData.name}`);
        createdCount++;
      }
    }

    console.log("\n✨ Seeding completed!");
    console.log(`   📊 Created: ${createdCount} products`);
    console.log(`   🔄 Updated: ${updatedCount} products`);
    console.log(`   👥 Printers: ${Object.keys(printerProfiles).length}`);

    // 3. Hiển thị thông tin products
    console.log("\n📋 Product URLs for testing:");
    const products = await Product.find({
      slug: { $in: mockData.products.map((p) => p.slug) },
    })
      .select("_id name slug category")
      .lean();

    products.forEach((product) => {
      console.log(`   🔗 ${product.name}`);
      console.log(`      ID: ${product._id}`);
      console.log(`      URL: http://localhost:5173/products/${product._id}`);
      console.log(
        `      API: http://localhost:5000/api/products/${product._id}`
      );
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run
seedMockProducts();
