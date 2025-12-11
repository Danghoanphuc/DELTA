// apps/customer-backend/src/scripts/test-login-response.js
/**
 * Test what data is returned when user logs in
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function testLoginResponse() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const { User } = await import("../shared/models/user.model.js");
  const { AuthRepository } = await import("./auth/auth.repository.js");

  const authRepo = new AuthRepository();

  console.log("=".repeat(70));
  console.log("🔐 SIMULATING LOGIN RESPONSE");
  console.log("=".repeat(70));

  // Test for shipper user
  console.log("\n" + "─".repeat(70));
  console.log("🚚 SHIPPER USER: danghoanphuc16@gmail.com");
  console.log("─".repeat(70));

  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (shipper) {
    console.log("\n1️⃣ Raw User from DB:");
    console.log(`   _id: ${shipper._id}`);
    console.log(`   email: ${shipper.email}`);
    console.log(`   shipperProfileId: ${shipper.shipperProfileId}`);
    console.log(`   organizationProfileId: ${shipper.organizationProfileId}`);
    console.log(`   customerProfileId: ${shipper.customerProfileId}`);

    // Simulate what findUserById returns (like in auth controller)
    const userWithProfile = await authRepo.findUserById(shipper._id);
    console.log("\n2️⃣ User from findUserById (what login returns):");
    console.log(`   _id: ${userWithProfile._id}`);
    console.log(`   email: ${userWithProfile.email}`);
    console.log(`   shipperProfileId: ${userWithProfile.shipperProfileId}`);
    console.log(
      `   organizationProfileId: ${userWithProfile.organizationProfileId}`
    );
    console.log(`   customerProfileId: ${userWithProfile.customerProfileId}`);

    // Check if shipperProfileId is in the returned object
    const userObj = userWithProfile.toObject
      ? userWithProfile.toObject()
      : userWithProfile;
    console.log("\n3️⃣ User as plain object (what JSON.stringify returns):");
    console.log(`   shipperProfileId: ${userObj.shipperProfileId}`);
    console.log(
      `   Has shipperProfileId key: ${"shipperProfileId" in userObj}`
    );

    // Simulate the exact response structure
    const accessToken = jwt.sign(
      { userId: shipper._id.toString() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const loginResponse = {
      success: true,
      data: {
        accessToken,
        user: userObj,
      },
      message: "Đăng nhập Google thành công!",
    };

    console.log("\n4️⃣ Full login response structure:");
    console.log(
      `   data.user.shipperProfileId: ${loginResponse.data.user.shipperProfileId}`
    );
    console.log(
      `   data.user keys: ${Object.keys(loginResponse.data.user).join(", ")}`
    );
  } else {
    console.log("❌ Shipper user not found!");
  }

  // Test for customer user
  console.log("\n" + "─".repeat(70));
  console.log("👤 CUSTOMER USER: phucdh911@gmail.com");
  console.log("─".repeat(70));

  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (customer) {
    const userWithProfile = await authRepo.findUserById(customer._id);
    const userObj = userWithProfile.toObject
      ? userWithProfile.toObject()
      : userWithProfile;

    console.log("\n   User as plain object:");
    console.log(`   shipperProfileId: ${userObj.shipperProfileId}`);
    console.log(`   organizationProfileId: ${userObj.organizationProfileId}`);
    console.log(`   customerProfileId: ${userObj.customerProfileId}`);
  }

  await mongoose.disconnect();
  console.log("\n✅ Test complete");
}

testLoginResponse().catch(console.error);
