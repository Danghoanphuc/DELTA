// Test shipper login
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function testLogin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    // Import User model
    const { User } = await import("../shared/models/user.model.js");

    const email = "shipper@printz.vn";
    const password = "Shipper@123";

    console.log("\n📋 Testing login for:", email);

    // Find user with hashedPassword
    const user = await User.findOne({ email }).select("+hashedPassword");

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("✅ User found:");
    console.log("- _id:", user._id);
    console.log("- email:", user.email);
    console.log("- role:", user.role);
    console.log("- isVerified:", user.isVerified);
    console.log("- isActive:", user.isActive);
    console.log("- hashedPassword exists:", !!user.hashedPassword);

    // Test comparePassword method
    console.log("\n🔐 Testing comparePassword method...");
    if (typeof user.comparePassword === "function") {
      const isMatch = await user.comparePassword(password);
      console.log("- comparePassword result:", isMatch);
    } else {
      console.log("❌ comparePassword method not found!");

      // Manual bcrypt compare
      console.log("\n🔐 Manual bcrypt compare...");
      const manualMatch = await bcrypt.compare(password, user.hashedPassword);
      console.log("- Manual bcrypt result:", manualMatch);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLogin();
