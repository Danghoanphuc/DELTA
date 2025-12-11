// apps/customer-backend/src/scripts/debug-shipper-api.js
/**
 * Debug shipper API - simulate what happens when shipper calls API
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

async function debugShipperAPI() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas\n");

  const { User } = await import("../shared/models/user.model.js");
  const { ShipperProfile } = await import(
    "../shared/models/shipper-profile.model.js"
  );
  const { DeliveryCheckin } = await import(
    "../modules/delivery-checkin/delivery-checkin.model.js"
  );

  console.log("=".repeat(60));
  console.log("🔍 DEBUG SHIPPER API FLOW");
  console.log("=".repeat(60));

  // 1. Find shipper user
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  console.log("\n1️⃣ SHIPPER USER FROM DB:");
  console.log(`   _id: ${shipper?._id}`);
  console.log(`   email: ${shipper?.email}`);
  console.log(`   shipperProfileId: ${shipper?.shipperProfileId}`);
  console.log(`   authMethod: ${shipper?.authMethod}`);
  console.log(`   googleId: ${shipper?.googleId}`);
  console.log(`   isActive: ${shipper?.isActive}`);

  if (!shipper) {
    console.log("\n❌ Shipper user not found!");
    await mongoose.disconnect();
    return;
  }

  // 2. Check shipper profile
  console.log("\n2️⃣ SHIPPER PROFILE:");
  if (shipper.shipperProfileId) {
    const profile = await ShipperProfile.findById(shipper.shipperProfileId);
    console.log(`   _id: ${profile?._id}`);
    console.log(`   userId: ${profile?.userId}`);
    console.log(`   isActive: ${profile?.isActive}`);
    console.log(`   name: ${profile?.name}`);

    if (!profile) {
      console.log("   ⚠️ Profile ID exists but profile not found!");
    } else if (!profile.isActive) {
      console.log("   ⚠️ Profile exists but is NOT active!");
    } else {
      console.log("   ✅ Profile is valid and active");
    }
  } else {
    console.log("   ❌ User has NO shipperProfileId!");
  }

  // 3. Simulate auth middleware
  console.log("\n3️⃣ SIMULATING AUTH MIDDLEWARE:");
  const token = jwt.sign({ userId: shipper._id.toString() }, JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(`   Generated token for userId: ${shipper._id}`);

  // Decode and verify
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log(`   Decoded userId: ${decoded.userId}`);

  // Fetch user like auth middleware does
  const userFromToken = await User.findById(decoded.userId).select(
    "-hashedPassword -verificationToken -verificationTokenExpiresAt"
  );
  console.log(`   User from token lookup:`);
  console.log(`      _id: ${userFromToken?._id}`);
  console.log(`      shipperProfileId: ${userFromToken?.shipperProfileId}`);
  console.log(`      isActive: ${userFromToken?.isActive}`);

  // 4. Simulate isShipper middleware
  console.log("\n4️⃣ SIMULATING isShipper MIDDLEWARE:");
  if (!userFromToken?.shipperProfileId) {
    console.log("   ❌ WOULD FAIL: User has no shipperProfileId");
  } else {
    const shipperProfile = await ShipperProfile.findById(
      userFromToken.shipperProfileId
    );
    if (!shipperProfile || !shipperProfile.isActive) {
      console.log("   ❌ WOULD FAIL: Shipper profile inactive or not found");
    } else {
      console.log("   ✅ WOULD PASS: User is valid shipper");
    }
  }

  // 5. Check DeliveryCheckins for this shipper
  console.log("\n5️⃣ DELIVERY CHECKINS FOR SHIPPER:");
  const checkins = await DeliveryCheckin.find({ shipperId: shipper._id });
  console.log(`   Found ${checkins.length} checkins`);
  checkins.forEach((c) => {
    console.log(`   - ${c.orderNumber} | ${c.status} | ${c.checkinAt}`);
  });

  // 6. Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 SUMMARY:");
  console.log("=".repeat(60));

  const issues = [];
  if (!shipper.shipperProfileId) {
    issues.push("User missing shipperProfileId");
  }
  if (shipper.shipperProfileId) {
    const profile = await ShipperProfile.findById(shipper.shipperProfileId);
    if (!profile) issues.push("ShipperProfile not found");
    else if (!profile.isActive) issues.push("ShipperProfile is inactive");
  }
  if (checkins.length === 0) {
    issues.push("No DeliveryCheckins found for shipper");
  }

  if (issues.length === 0) {
    console.log("✅ All checks passed! API should work.");
    console.log("\nIf shipper still can't see data, check:");
    console.log("1. Is the backend server running?");
    console.log("2. Is the frontend sending the correct token?");
    console.log("3. Check browser console for API errors");
  } else {
    console.log("❌ Issues found:");
    issues.forEach((issue) => console.log(`   - ${issue}`));
  }

  await mongoose.disconnect();
  console.log("\n✅ Debug complete");
}

debugShipperAPI();
