// Script to check user profile IDs
import mongoose from "mongoose";
import { User } from "../src/shared/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function checkUserProfiles() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MongoDB connection string not found in environment");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const userId = "6919b3fe10497b9e95875420";
    const user = await User.findById(userId).lean();

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("\n📋 User Profile IDs:");
    console.log("- customerProfileId:", user.customerProfileId || "null");
    console.log("- printerProfileId:", user.printerProfileId || "null");
    console.log(
      "- organizationProfileId:",
      user.organizationProfileId || "null"
    );

    console.log("\n🎯 Detected Context:");
    if (user.organizationProfileId) {
      console.log("→ ORGANIZATION (priority 1)");
    } else if (user.printerProfileId) {
      console.log("→ PRINTER (priority 2)");
    } else {
      console.log("→ CUSTOMER (default)");
    }

    // Check if user has multiple profiles
    const profileCount = [
      user.customerProfileId,
      user.printerProfileId,
      user.organizationProfileId,
    ].filter(Boolean).length;

    if (profileCount > 1) {
      console.log("\n⚠️  WARNING: User has multiple profiles!");
      console.log("This may cause redirect issues.");
      console.log("\nRecommendation:");
      console.log("- If user is ORGANIZATION: Remove printerProfileId");
      console.log("- If user is PRINTER: Remove organizationProfileId");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUserProfiles();
