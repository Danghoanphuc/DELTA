#!/usr/bin/env node
/**
 * Simple script to add admin to delivery threads using MongoDB driver
 * Run: node scripts/add-admin-simple.js <admin-user-id>
 */

import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;
const ADMIN_USER_ID = process.argv[2] || process.env.ADMIN_SUPPORT_USER_ID;

if (!MONGODB_URI) {
  console.error("❌ MongoDB URI not found");
  process.exit(1);
}

if (!ADMIN_USER_ID) {
  console.error("❌ Admin User ID not provided");
  console.error("Usage: node scripts/add-admin-simple.js <admin-user-id>");
  process.exit(1);
}

console.log("═══════════════════════════════════════════════════════");
console.log("  Add Admin to Delivery Threads");
console.log("═══════════════════════════════════════════════════════\n");
console.log(`Admin ID: ${ADMIN_USER_ID}\n`);

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db();
    const collection = db.collection("deliverythreads");

    // Find all threads
    const threads = await collection.find({}).toArray();
    console.log(`📋 Found ${threads.length} thread(s)\n`);

    if (threads.length === 0) {
      console.log("⚠️ No threads found");
      return;
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const thread of threads) {
      // Check if admin already in participants
      const hasAdmin = thread.participants?.some(
        (p) => p.userId.toString() === ADMIN_USER_ID
      );

      if (hasAdmin) {
        console.log(
          `⏭️  ${thread.orderNumber || thread._id}: Admin already added`
        );
        skippedCount++;
        continue;
      }

      // Add admin to participants
      await collection.updateOne(
        { _id: thread._id },
        {
          $push: {
            participants: {
              userId: new ObjectId(ADMIN_USER_ID),
              userModel: "User",
              userName: "Admin Support",
              role: "admin",
              joinedAt: new Date(),
            },
          },
        }
      );

      console.log(`✅ ${thread.orderNumber || thread._id}: Added admin`);
      addedCount++;
    }

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  Summary");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log(`Total: ${threads.length}`);
    console.log(`Added: ${addedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await client.close();
    console.log("📡 Disconnected");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal:", error);
    process.exit(1);
  });
