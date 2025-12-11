#!/usr/bin/env node
/**
 * Script to add admin to existing delivery threads
 * Run: node scripts/add-admin-to-threads.js <admin-user-id>
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;
const ADMIN_USER_ID = process.argv[2] || process.env.ADMIN_SUPPORT_USER_ID;

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI or MONGODB_CONNECTIONSTRING not found in .env file"
  );
  process.exit(1);
}

if (!ADMIN_USER_ID) {
  console.error("❌ Admin User ID not provided");
  console.error("Usage: node scripts/add-admin-to-threads.js <admin-user-id>");
  console.error("Or set ADMIN_SUPPORT_USER_ID in .env file");
  process.exit(1);
}

console.log("═══════════════════════════════════════════════════════");
console.log("  Add Admin to Existing Delivery Threads");
console.log("═══════════════════════════════════════════════════════\n");

async function addAdminToThreads() {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...\n");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get DeliveryThread model
    const DeliveryThread = mongoose.model("DeliveryThread");

    // Find all threads
    console.log("🔍 Finding delivery threads...\n");
    const threads = await DeliveryThread.find({});
    console.log(`✅ Found ${threads.length} thread(s)\n`);

    if (threads.length === 0) {
      console.log("⚠️ No threads found. Nothing to do.");
      return;
    }

    // Add admin to each thread
    let addedCount = 0;
    let skippedCount = 0;

    for (const thread of threads) {
      // Check if admin already in participants
      const isParticipant = thread.participants.some(
        (p) => p.userId.toString() === ADMIN_USER_ID
      );

      if (isParticipant) {
        console.log(`⏭️  Thread ${thread._id}: Admin already participant`);
        skippedCount++;
        continue;
      }

      // Add admin
      thread.participants.push({
        userId: ADMIN_USER_ID,
        userModel: "User",
        userName: "Admin Support",
        role: "admin",
        joinedAt: new Date(),
      });

      await thread.save();
      console.log(
        `✅ Thread ${thread._id}: Added admin (Order: ${thread.orderNumber})`
      );
      addedCount++;
    }

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  Summary");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log(`Total threads: ${threads.length}`);
    console.log(`Added admin: ${addedCount}`);
    console.log(`Already participant: ${skippedCount}`);
    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

addAdminToThreads()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
