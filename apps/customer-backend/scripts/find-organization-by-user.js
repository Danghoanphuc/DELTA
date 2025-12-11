// Script to find organization profile by user email
import mongoose from "mongoose";
import { User } from "../src/shared/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function findOrganization() {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const userId = "6919b3fe10497b9e95875420";
    const user = await User.findById(userId).lean();

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("\n👤 User Info:");
    console.log("- Email:", user.email);
    console.log("- Display Name:", user.displayName);

    // Import organization model
    const { OrganizationProfile } = await import(
      "../src/modules/organizations/organization.model.js"
    );

    // Try to find by owner or team member
    const orgAsOwner = await OrganizationProfile.findOne({
      owner: userId,
    }).lean();
    const orgAsTeamMember = await OrganizationProfile.findOne({
      "teamMembers.userId": userId,
    }).lean();

    if (orgAsOwner) {
      console.log("\n✅ Found as OWNER:");
      console.log("- Organization ID:", orgAsOwner._id);
      console.log("- Business Name:", orgAsOwner.businessName);
      console.log(
        "\nTo assign: node scripts/assign-organization-profile.js",
        orgAsOwner._id
      );
    } else if (orgAsTeamMember) {
      console.log("\n✅ Found as TEAM MEMBER:");
      console.log("- Organization ID:", orgAsTeamMember._id);
      console.log("- Business Name:", orgAsTeamMember.businessName);
      console.log(
        "\nTo assign: node scripts/assign-organization-profile.js",
        orgAsTeamMember._id
      );
    } else {
      console.log("\n❌ No organization profile found for this user");
      console.log("User needs to complete organization onboarding first");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

findOrganization();
