// apps/admin-backend/scripts/debug-posts.ts
// Debug script to check posts and their authorProfile/supplierId

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

async function debugPosts() {
  console.log("🔍 Debugging posts data...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const postsCollection = db.collection("supplierposts");
    const suppliersCollection = db.collection("suppliers");

    // Get all posts
    const posts = await postsCollection.find({}).toArray();
    console.log(`📊 Total posts: ${posts.length}\n`);
    console.log("=".repeat(80));

    for (const post of posts) {
      console.log(`\n📝 Post: "${post.title || "No title"}"`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Slug: ${post.slug || "No slug"}`);
      console.log(`   Category: ${post.category || "No category"}`);
      console.log(`   SupplierId: ${post.supplierId || "❌ NO SUPPLIER ID"}`);

      // Check authorProfile
      if (post.authorProfile) {
        console.log(`   AuthorProfile:`);
        console.log(`     - Name: ${post.authorProfile.name || "❌ EMPTY"}`);
        console.log(`     - Title: ${post.authorProfile.title || "❌ EMPTY"}`);
        console.log(
          `     - Bio: ${post.authorProfile.bio ? "✓ Has bio" : "❌ No bio"}`
        );
      } else {
        console.log(`   AuthorProfile: ❌ NOT SET`);
      }

      // Check supplier exists
      if (post.supplierId) {
        const supplier = await suppliersCollection.findOne({
          _id: new mongoose.Types.ObjectId(post.supplierId.toString()),
        });
        if (supplier) {
          console.log(
            `   Supplier found: "${supplier.name}" (type: ${supplier.type})`
          );
        } else {
          console.log(`   ❌ Supplier NOT FOUND in database!`);
        }
      }
      console.log("-".repeat(80));
    }

    // List all suppliers
    console.log("\n\n📦 All Suppliers in database:");
    const suppliers = await suppliersCollection.find({}).toArray();
    for (const s of suppliers) {
      console.log(`   - ${s.name} (${s._id}) - type: ${s.type}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Done");
  }
}

debugPosts();
