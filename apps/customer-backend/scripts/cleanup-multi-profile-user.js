// Script to clean up user with multiple profile IDs
// Keep only organizationProfileId, remove printerProfileId
import mongoose from "mongoose";
import { User } from "../src/shared/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function cleanupUser() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const userId = "6919b3fe10497b9e95875420";
    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("\n📋 Before cleanup:");
    console.log("- customerProfileId:", user.customerProfileId);
    console.log("- printerProfileId:", user.printerProfileId);
    console.log("- organizationProfileId:", user.organizationProfileId);

    // Keep organization, remove printer
    if (user.organizationProfileId && user.printerProfileId) {
      console.log("\n⚠️  User has both organization and printer profiles");
      console.log("Removing printerProfileId to avoid conflicts...");

      user.printerProfileId = null;
      await user.save();

      console.log("\n✅ After cleanup:");
      console.log("- customerProfileId:", user.customerProfileId);
      console.log("- printerProfileId:", user.printerProfileId);
      console.log("- organizationProfileId:", user.organizationProfileId);

      console.log("\n🎯 User will now redirect to: /organization/dashboard");
    } else {
      console.log("\n✅ User profile is clean, no action needed");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupUser();
