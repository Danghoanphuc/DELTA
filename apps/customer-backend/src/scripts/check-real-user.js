// apps/customer-backend/src/scripts/check-real-user.js
/**
 * Check if the user exists and find their actual orders
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function checkRealUser() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );

    // Find ALL users with similar emails
    console.log("=".repeat(60));
    console.log("🔍 FINDING ALL USERS WITH 'phuc' IN EMAIL");
    console.log("=".repeat(60));

    const phucUsers = await User.find({
      email: { $regex: /phuc/i },
    })
      .select("email displayName _id authMethod createdAt")
      .lean();

    console.log(`\nFound ${phucUsers.length} users:`);
    for (const u of phucUsers) {
      console.log(`\n👤 ${u.email}`);
      console.log(`   ID: ${u._id}`);
      console.log(`   Name: ${u.displayName || "N/A"}`);
      console.log(`   Auth: ${u.authMethod}`);
      console.log(`   Created: ${u.createdAt}`);

      // Check orders for this user
      const orders = await MasterOrder.find({
        customerId: u._id,
      }).countDocuments();
      console.log(`   Orders: ${orders}`);
    }

    // Check all users
    console.log("\n" + "=".repeat(60));
    console.log("📋 ALL USERS IN SYSTEM");
    console.log("=".repeat(60));

    const allUsers = await User.find({})
      .select("email displayName _id authMethod")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    for (const u of allUsers) {
      const orders = await MasterOrder.find({
        customerId: u._id,
      }).countDocuments();
      console.log(`${u.email} | ${u.displayName || "N/A"} | Orders: ${orders}`);
    }

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
    process.exit(0);
  }
}

checkRealUser();
