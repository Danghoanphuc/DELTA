#!/usr/bin/env node
/**
 * Script to find admin user ID
 * Run: node scripts/find-admin-user.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI or MONGODB_CONNECTIONSTRING not found in .env file"
  );
  process.exit(1);
}

console.log("═══════════════════════════════════════════════════════");
console.log("  Find Admin User ID");
console.log("═══════════════════════════════════════════════════════\n");

async function findAdminUser() {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...\n");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find admin users
    console.log("🔍 Searching for admin users...\n");

    const User = mongoose.model("User");
    const admins = await User.find({ role: "admin" })
      .select("_id email displayName role createdAt")
      .lean();

    if (admins.length === 0) {
      console.log("⚠️ No admin users found");
      console.log("\n💡 Create an admin user first:");
      console.log("   1. Register a user");
      console.log('   2. Update role to "admin" in database');
      console.log("   3. Run this script again");
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.displayName || admin.email}`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${new Date(admin.createdAt).toLocaleString()}`);
      console.log("");
    });

    console.log("═══════════════════════════════════════════════════════");
    console.log("  Next Steps");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log("1. Copy the admin user ID above");
    console.log("2. Add to .env file:");
    console.log(`   ADMIN_SUPPORT_USER_ID=${admins[0]._id}`);
    console.log("3. Run migration script:");
    console.log(`   node scripts/add-admin-to-threads.js ${admins[0]._id}`);
    console.log("4. Restart server");
    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

findAdminUser()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
