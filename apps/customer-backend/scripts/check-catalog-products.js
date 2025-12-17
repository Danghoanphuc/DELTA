// Check CatalogProducts in database
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function checkCatalogProducts() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    console.log("Connecting to:", mongoUri?.substring(0, 50) + "...");
    await mongoose.connect(mongoUri);

    // Import model
    const { CatalogProduct } = await import(
      "../src/modules/catalog/catalog-product.model.js"
    );

    const allProducts = await CatalogProduct.find({})
      .select("name isActive isPublished categoryId slug")
      .lean();

    console.log("\n📦 CatalogProducts in database:\n");
    console.log("Total:", allProducts.length);
    console.log("\n" + "=".repeat(70));

    if (allProducts.length === 0) {
      console.log("\n⚠️  No CatalogProducts found!");
      console.log("Admin chưa upload sản phẩm nào vào catalog.");
    } else {
      allProducts.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   isActive: ${p.isActive}`);
        console.log(`   isPublished: ${p.isPublished}`);
        console.log(`   Slug: ${p.slug}`);
      });
    }

    console.log("\n" + "=".repeat(70));

    // Check public products
    const publicProducts = await CatalogProduct.find({
      isActive: true,
      isPublished: true,
    })
      .select("name")
      .lean();

    console.log(
      `\n✅ Public CatalogProducts (isActive: true, isPublished: true): ${publicProducts.length}`
    );
    publicProducts.forEach((p) => console.log(`   - ${p.name}`));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkCatalogProducts();
