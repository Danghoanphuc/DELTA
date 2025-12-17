// Check product field types
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function checkTypes() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/printz-customer";
    await mongoose.connect(mongoUri);

    const db = mongoose.connection.db;
    const products = await db.collection("products").find({}).toArray();

    console.log("\n📦 Products field types:\n");
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   isActive: ${p.isActive} (type: ${typeof p.isActive})`);
      console.log(`   isDraft: ${p.isDraft} (type: ${typeof p.isDraft})`);
      console.log("");
    });

    // Test query
    console.log("Testing queries:");
    const test1 = await db
      .collection("products")
      .find({ isActive: true })
      .toArray();
    console.log(`   isActive: true => ${test1.length} products`);

    const test2 = await db
      .collection("products")
      .find({ isDraft: false })
      .toArray();
    console.log(`   isDraft: false => ${test2.length} products`);

    const test3 = await db
      .collection("products")
      .find({ isActive: true, isDraft: false })
      .toArray();
    console.log(`   Both => ${test3.length} products`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkTypes();
