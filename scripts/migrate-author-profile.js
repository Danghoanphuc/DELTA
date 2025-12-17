// scripts/migrate-author-profile.js
// Migration script to add authorProfile to existing posts

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";

async function migrateAuthorProfile() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const SupplierPost = mongoose.model("SupplierPost");

    // Map supplier type to Vietnamese
    const SUPPLIER_TYPE_LABELS = {
      manufacturer: "Nhà sản xuất",
      distributor: "Nhà phân phối",
      printer: "Nhà in ấn",
      dropshipper: "Dropshipper",
      artisan: "Nghệ nhân",
    };

    // Find all posts without authorProfile
    const postsWithoutAuthor = await SupplierPost.find({
      $or: [
        { authorProfile: { $exists: false } },
        { "authorProfile.name": { $exists: false } },
      ],
    }).populate("supplierId", "name email type logo");

    console.log(
      `\n📊 Found ${postsWithoutAuthor.length} posts without author profile`
    );

    if (postsWithoutAuthor.length === 0) {
      console.log("✨ All posts already have author profiles!");
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;

    for (const post of postsWithoutAuthor) {
      try {
        const supplier = post.supplierId;

        if (!supplier) {
          console.log(`⚠️  Post ${post._id} has no supplier - skipping`);
          failed++;
          continue;
        }

        // Get supplier type label
        const supplierTypeLabel = supplier.type
          ? SUPPLIER_TYPE_LABELS[supplier.type] || "Nhà cung cấp"
          : "Nhà cung cấp";

        // Set default author profile from supplier
        post.authorProfile = {
          name: supplier.name || "Nhà cung cấp",
          title: supplierTypeLabel,
          avatar: supplier.logo || undefined,
          bio: `${
            supplier.name || "Nhà cung cấp"
          } - ${supplierTypeLabel} cung cấp sản phẩm chất lượng cao.`,
        };

        await post.save();
        updated++;
        console.log(
          `✅ Updated post ${post._id} - ${
            post.title || "Untitled"
          } (${supplierTypeLabel})`
        );
      } catch (error) {
        console.error(`❌ Failed to update post ${post._id}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📈 Migration complete!`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateAuthorProfile();
