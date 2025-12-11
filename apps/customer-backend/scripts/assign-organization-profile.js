// Script to assign organization profile to user
import mongoose from "mongoose";
import { User } from "../src/shared/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function assignOrganizationProfile() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const userId = "6919b3fe10497b9e95875420";
    const organizationProfileId = process.argv[2]; // Get from command line

    if (!organizationProfileId) {
      console.log(
        "❌ Usage: node assign-organization-profile.js <organizationProfileId>"
      );
      process.exit(1);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("\n📋 Before:");
    console.log("- printerProfileId:", user.printerProfileId);
    console.log("- organizationProfileId:", user.organizationProfileId);

    // Assign organization profile
    user.organizationProfileId = organizationProfileId;
    await user.save();

    console.log("\n✅ After:");
    console.log("- printerProfileId:", user.printerProfileId);
    console.log("- organizationProfileId:", user.organizationProfileId);

    console.log("\n🎯 User will now redirect to: /organization/dashboard");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

assignOrganizationProfile();
