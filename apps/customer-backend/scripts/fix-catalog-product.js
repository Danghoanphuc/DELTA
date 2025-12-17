// Fix existing CatalogProduct to make it visible
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function fixCatalogProduct() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    const { CatalogProduct } = await import(
      "../src/modules/catalog/catalog-product.model.js"
    );

    // Update the "áo" product
    const result = await CatalogProduct.updateOne(
      { slug: "ao-miy99bzd" },
      {
        $set: {
          isActive: true,
          isPublished: true,
        },
      }
    );

    console.log("✅ Updated:", result.modifiedCount, "product(s)");

    // Verify
    const product = await CatalogProduct.findOne({ slug: "ao-miy99bzd" })
      .select("name isActive isPublished")
      .lean();

    console.log("\n📦 Product after update:");
    console.log(product);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixCatalogProduct();
