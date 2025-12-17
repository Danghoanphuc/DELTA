// apps/admin-backend/scripts/migrate-author-profile.ts
// Migration script to update authorProfile for existing posts based on their supplier info

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

// Map supplier type to Vietnamese
const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  manufacturer: "Nhà sản xuất",
  distributor: "Nhà phân phối",
  printer: "Nhà in ấn",
  dropshipper: "Dropshipper",
  artisan: "Nghệ nhân",
};

async function migrateAuthorProfiles() {
  console.log("🚀 Starting author profile migration...\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get collections directly (avoid model conflicts)
    const db = mongoose.connection.db;
    const postsCollection = db.collection("supplierposts");
    const suppliersCollection = db.collection("suppliers");

    // Find all posts
    const allPosts = await postsCollection.find({}).toArray();
    console.log(`📊 Found ${allPosts.length} total posts\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const post of allPosts) {
      try {
        // Get supplier info
        const supplier = post.supplierId
          ? await suppliersCollection.findOne({
              _id: new mongoose.Types.ObjectId(post.supplierId.toString()),
            })
          : null;

        if (!supplier) {
          console.log(
            `  ⚠️ Post "${post.title || post._id}" has no supplier, skipping...`
          );
          skippedCount++;
          continue;
        }

        // Build correct authorProfile from supplier
        const supplierName = supplier.name;
        const supplierType = supplier.type as string;
        const supplierLogo = supplier.logo;

        const correctAuthorProfile = {
          name: supplierName,
          title: SUPPLIER_TYPE_LABELS[supplierType] || "Đối tác",
          avatar: supplierLogo || "",
          bio: `${supplierName} - ${
            SUPPLIER_TYPE_LABELS[supplierType] || "Đối tác"
          } cung cấp sản phẩm chất lượng cao cho Printz.`,
        };

        // Check if update is needed
        const currentProfile = post.authorProfile;
        const needsUpdate =
          !currentProfile ||
          currentProfile.name !== correctAuthorProfile.name ||
          currentProfile.title !== correctAuthorProfile.title;

        if (!needsUpdate) {
          console.log(
            `  ✓ Post "${
              post.title || post._id
            }" already has correct authorProfile`
          );
          skippedCount++;
          continue;
        }

        // Update the post
        await postsCollection.updateOne(
          { _id: post._id },
          { $set: { authorProfile: correctAuthorProfile } }
        );

        updatedCount++;
        console.log(
          `  ✅ Updated: "${post.title || post._id}" -> ${
            correctAuthorProfile.name
          } (${correctAuthorProfile.title})`
        );
      } catch (err) {
        errorCount++;
        console.error(`  ❌ Error updating post ${post._id}:`, err);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   Total posts: ${allPosts.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already correct or no supplier): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

// Run migration
migrateAuthorProfiles()
  .then(() => {
    console.log("\n🎉 Migration completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
