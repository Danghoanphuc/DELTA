// apps/customer-backend/src/scripts/create-shipper.js
// Script to create a shipper account for testing

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function createShipper() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { ShipperProfile } = await import(
      "../shared/models/shipper-profile.model.js"
    );

    // Shipper account details
    const shipperEmail = "shipper@printz.vn";
    const shipperPassword = "Shipper@123";

    // Delete existing shipper if exists
    const existingUser = await User.findOne({ email: shipperEmail });
    if (existingUser) {
      console.log("⚠️ Shipper account already exists, deleting...");
      // Delete shipper profile if exists
      if (existingUser.shipperProfileId) {
        await ShipperProfile.findByIdAndDelete(existingUser.shipperProfileId);
      }
      await User.findByIdAndDelete(existingUser._id);
      console.log("✅ Deleted existing shipper account");
    }

    // Create new shipper user
    const newUser = new User({
      email: shipperEmail,
      displayName: "Shipper Test",
      username: "shipper_test",
      hashedPassword: shipperPassword, // Will be hashed by pre-save hook
      authMethod: "local",
      isVerified: true,
      isActive: true,
    });

    // Create shipper profile
    const shipperProfile = new ShipperProfile({
      userId: newUser._id,
      vehicleType: "motorbike",
      vehiclePlate: "59-X1 12345",
      phoneNumber: "0901234567",
      isActive: true,
      totalDeliveries: 0,
      rating: 5.0,
    });

    // Link profile to user
    newUser.shipperProfileId = shipperProfile._id;

    // Save both
    await newUser.save();
    await shipperProfile.save();

    console.log("✅ Created shipper account!");
    console.log("� SEmail:", shipperEmail);
    console.log("🔑 Password:", shipperPassword);
    console.log("🆔 User ID:", newUser._id);
    console.log("� ShipperrProfile ID:", shipperProfile._id);

    console.log("\n========================================");
    console.log("🚚 SHIPPER LOGIN CREDENTIALS:");
    console.log("========================================");
    console.log("📧 Email:    shipper@printz.vn");
    console.log("🔑 Password: Shipper@123");
    console.log("🌐 URL:      http://localhost:5173/shipper");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

createShipper();
