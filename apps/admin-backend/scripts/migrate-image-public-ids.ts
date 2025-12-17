// apps/admin-backend/scripts/migrate-image-public-ids.ts
// Migration script to extract and store Cloudinary public IDs for existing posts
// Run: npx ts-node scripts/migrate-image-public-ids.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?(?:\?|$)/i);
    if (match && match[1]) {
      return match[1].replace(/\.[a-z]+$/i, "");
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

// Extract all Cloudinary public IDs from content and media
function extractCloudinaryPublicIds(
  content: string,
  media?: Array<{ url: string; publicId?: string }>
): string[] {
  const publicIds: string[] = [];

  // Extract from content
  const urlRegex =
    /https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/upload\/[^\s"'<>]+/gi;
  const urls = content.match(urlRegex) || [];

  for (const url of urls) {
    const publicId = extractPublicIdFromUrl(url);
    if (publicId && !publicIds.includes(publicId)) {
      publicIds.push(publicId);
    }
  }

  // Extract from media array
  if (media && media.length > 0) {
    for (const item of media) {
      if (item.publicId && !publicIds.includes(item.publicId)) {
        publicIds.push(item.publicId);
        continue;
      }
      const publicId = extractPublicIdFromUrl(item.url);
      if (publicId && !publicIds.includes(publicId)) {
        publicIds.push(publicId);
      }
    }
  }

  return publicIds;
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in environment");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ Database connection not established");
    process.exit(1);
  }

  const collection = db.collection("supplierposts");

  // Find all posts
  const posts = await collection.find({}).toArray();
  console.log(`📝 Found ${posts.length} posts to process`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const content = post.content || "";
    const media = post.media || [];

    const imagePublicIds = extractCloudinaryPublicIds(content, media);

    if (imagePublicIds.length > 0) {
      await collection.updateOne(
        { _id: post._id },
        { $set: { imagePublicIds } }
      );
      console.log(
        `  ✅ ${post.title || post._id}: ${imagePublicIds.length} images`
      );
      updated++;
    } else {
      console.log(`  ⏭️  ${post.title || post._id}: no images`);
      skipped++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`  - Updated: ${updated} posts`);
  console.log(`  - Skipped: ${skipped} posts (no images)`);

  await mongoose.disconnect();
  console.log("\n✅ Migration completed!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
