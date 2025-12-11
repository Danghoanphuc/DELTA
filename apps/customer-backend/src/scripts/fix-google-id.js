// apps/customer-backend/src/scripts/fix-google-id.js
/**
 * Fix: Remove placeholder googleId so real Google login can link properly
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function fixGoogleId() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");

    console.log("=".repeat(60));
    console.log("🔧 FIXING GOOGLE ID PLACEHOLDERS");
    console.log("=".repeat(60));

    // Find users with placeholder googleId
    const usersWithPlaceholder = await User.find({
      googleId: { $regex: /^google_placeholder/ },
    });

    console.log(
      `\nFound ${usersWithPlaceholder.length} users with placeholder googleId:\n`
    );

    for (const user of usersWithPlaceholder) {
      console.log(`👤 ${user.email}`);
      console.log(`   Old googleId: ${user.googleId}`);

      // Remove placeholder googleId
      user.googleId = undefined;
      await user.save();

      console.log(`   ✅ Removed placeholder googleId`);
      console.log(
        `   Now when you login with Google, it will link properly!\n`
      );
    }

    console.log("=".repeat(60));
    console.log("✅ FIX COMPLETE");
    console.log("=".repeat(60));
    console.log(`\n📝 NEXT STEPS:`);
    console.log(`   1. Login with Google as phucdh911@gmail.com`);
    console.log(`   2. System will find user by email and link real Google ID`);
    console.log(`   3. You should see your 10 orders!`);
    console.log(`\n   Same for shipper: danghoanphuc16@gmail.com`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
    process.exit(0);
  }
}

fixGoogleId();
