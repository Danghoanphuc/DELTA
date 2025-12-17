// Script to generate slugs for existing posts
import mongoose from "mongoose";
import "dotenv/config";
import { SupplierPost } from "../src/models/supplier-post.model.js";

const MONGODB_URI = process.env.MONGODB_URI!;

async function generateSlugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find posts without slugs
    const posts = await SupplierPost.find({
      title: { $exists: true, $ne: null, $ne: "" },
      slug: { $exists: false },
    });

    console.log(`📊 Found ${posts.length} posts without slugs`);

    for (const post of posts) {
      // Save will trigger pre-save hook to generate slug
      await post.save();
      console.log(`✅ Generated slug for: ${post.title} -> ${post.slug}`);
    }

    console.log("\n🎉 All slugs generated successfully!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

generateSlugs();
