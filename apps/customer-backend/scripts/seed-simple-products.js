// apps/customer-backend/scripts/seed-simple-products.js
// Script đơn giản để seed mock products

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { Product } from "../src/shared/models/product.model.js";

const mockDataPath = join(__dirname, "../../../mock-products.json");
const mockData = JSON.parse(readFileSync(mockDataPath, "utf-8"));

// Map categories từ mock data sang enum của model
const categoryMap = {
  "business-cards": "business-card",
  flyers: "flyer",
  "bottles-cups": "other",
};

async function seedSimpleProducts() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    // ✅ Use MONGODB_CONNECTIONSTRING to match the running service
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/printz-customer";
    console.log("URI:", mongoUri.substring(0, 50) + "...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected\n");

    const fakePrinterId = new mongoose.Types.ObjectId();
    console.log(`📝 Fake printer ID: ${fakePrinterId}\n`);

    console.log("📦 Seeding products...");
    let createdCount = 0;
    let updatedCount = 0;

    for (const productData of mockData.products) {
      const existingProduct = await Product.findOne({ slug: productData.slug });
      const mappedCategory = categoryMap[productData.category] || "other";

      const productPayload = {
        name: productData.name,
        slug: productData.slug,
        category: mappedCategory,
        printerProfileId: fakePrinterId,
        description: productData.description,
        images: productData.images,
        pricing: productData.pricing,
        basePrice: productData.pricing[0].pricePerUnit,
        specifications: productData.specifications,
        customization: productData.customization,
        isActive: productData.isActive,
        isDraft: productData.isDraft,
        stock: productData.stock,
        totalSold: productData.totalSold,
        views: productData.views,
        rating: productData.rating,
        totalReviews: productData.totalReviews,
        tags: productData.tags,
      };

      if (existingProduct) {
        await Product.findByIdAndUpdate(existingProduct._id, productPayload);
        console.log(`   🔄 Updated: ${productData.name}`);
        updatedCount++;
      } else {
        await Product.create(productPayload);
        console.log(`   ✅ Created: ${productData.name}`);
        createdCount++;
      }
    }

    console.log("\n✨ Done!");
    console.log(`   Created: ${createdCount} | Updated: ${updatedCount}`);

    const products = await Product.find({
      slug: { $in: mockData.products.map((p) => p.slug) },
    })
      .select("_id name slug category")
      .lean();

    console.log("\n" + "=".repeat(70));
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Frontend: http://localhost:5173/products/${product._id}`);
      console.log(`   API: http://localhost:5000/api/products/${product._id}`);
    });
    console.log("\n" + "=".repeat(70));
    console.log("\n💡 Copy URLs trên và test trong browser!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected\n");
    process.exit(0);
  }
}

seedSimpleProducts();
