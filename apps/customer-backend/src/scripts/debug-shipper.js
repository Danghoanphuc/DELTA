// Debug script to check shipper account
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function debugShipper() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const User = mongoose.connection.collection("users");
    const shipperEmail = "shipper@printz.vn";

    // Get user with all fields
    const user = await User.findOne({ email: shipperEmail });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("\n📋 User data:");
    console.log("- _id:", user._id);
    console.log("- email:", user.email);
    console.log("- displayName:", user.displayName);
    console.log("- role:", user.role);
    console.log("- isVerified:", user.isVerified);
    console.log("- isActive:", user.isActive);
    console.log("- authMethod:", user.authMethod);
    console.log("- hashedPassword exists:", !!user.hashedPassword);
    console.log("- hashedPassword length:", user.hashedPassword?.length);
    console.log(
      "- hashedPassword starts with $2:",
      user.hashedPassword?.startsWith("$2")
    );

    // Test password comparison
    const testPassword = "Shipper@123";
    console.log("\n🔐 Testing password comparison...");

    if (user.hashedPassword) {
      const isMatch = await bcrypt.compare(testPassword, user.hashedPassword);
      console.log("- Password match:", isMatch);

      if (!isMatch) {
        // Try hashing and comparing
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log("- New hash:", newHash.substring(0, 20) + "...");
        console.log(
          "- Stored hash:",
          user.hashedPassword.substring(0, 20) + "..."
        );
      }
    } else {
      console.log("❌ No hashedPassword field!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugShipper();
