// scripts/check-author-profile.js
// Quick check script to see which posts have/don't have authorProfile

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";

async function checkAuthorProfile() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const SupplierPost = mongoose.model("SupplierPost");

    // Count total posts
    const totalPosts = await SupplierPost.countDocuments();

    // Count posts with authorProfile
    const postsWithAuthor = await SupplierPost.countDocuments({
      "authorProfile.name": { $exists: true },
    });

    // Count posts without authorProfile
    const postsWithoutAuthor = totalPosts - postsWithAuthor;

    console.log("📊 AUTHOR PROFILE STATUS");
    console.log("========================");
    console.log(`Total posts:              ${totalPosts}`);
    console.log(
      `✅ With authorProfile:    ${postsWithAuthor} (${Math.round(
        (postsWithAuthor / totalPosts) * 100
      )}%)`
    );
    console.log(
      `❌ Without authorProfile: ${postsWithoutAuthor} (${Math.round(
        (postsWithoutAuthor / totalPosts) * 100
      )}%)`
    );
    console.log("");

    if (postsWithoutAuthor > 0) {
      console.log("⚠️  Some posts are missing authorProfile!");
      console.log("   Run: node scripts/migrate-author-profile.js");
      console.log("");

      // Show sample posts without author
      const samples = await SupplierPost.find({
        $or: [
          { authorProfile: { $exists: false } },
          { "authorProfile.name": { $exists: false } },
        ],
      })
        .limit(5)
        .select("_id title createdAt")
        .lean();

      console.log("📝 Sample posts without authorProfile:");
      samples.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.title || "Untitled"} (${post._id})`);
      });
    } else {
      console.log("✨ All posts have authorProfile! Great job!");
    }

    console.log("");
    process.exit(0);
  } catch (error) {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }
}

// Run check
checkAuthorProfile();
