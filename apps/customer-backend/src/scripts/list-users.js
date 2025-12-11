// apps/customer-backend/src/scripts/list-users.js
// List all users in database

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function listUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");

    const users = await User.find({})
      .select("email displayName shipperProfileId isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log("=".repeat(60));
    console.log("👥 USERS IN DATABASE (Latest 20)");
    console.log("=".repeat(60));

    for (const u of users) {
      const isShipper = u.shipperProfileId ? "🚚" : "👤";
      const status = u.isActive ? "✅" : "❌";
      console.log(`${isShipper} ${status} ${u.email}`);
      console.log(`   Name: ${u.displayName || "N/A"}`);
      console.log(`   ID: ${u._id}`);
      console.log("");
    }

    console.log(`Total users shown: ${users.length}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();
