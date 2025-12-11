// apps/customer-backend/src/scripts/test-shipper-api.js
/**
 * Test shipper API access directly
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
const API_URL = process.env.API_URL || "http://localhost:3001/api";

async function testShipperAPI() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas\n");

  const { User } = await import("../shared/models/user.model.js");
  const { ShipperProfile } = await import(
    "../shared/models/shipper-profile.model.js"
  );

  // 1. Find shipper user
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  console.log("=".repeat(60));
  console.log("🚚 SHIPPER USER:");
  console.log(`   _id: ${shipper?._id}`);
  console.log(`   email: ${shipper?.email}`);
  console.log(`   shipperProfileId: ${shipper?.shipperProfileId}`);
  console.log(`   isShipper (virtual): ${shipper?.isShipper}`);

  if (!shipper) {
    console.log("\n❌ Shipper user not found!");
    await mongoose.disconnect();
    return;
  }

  // 2. Check shipper profile
  if (shipper.shipperProfileId) {
    const profile = await ShipperProfile.findById(shipper.shipperProfileId);
    console.log(`\n📋 SHIPPER PROFILE:`);
    console.log(`   _id: ${profile?._id}`);
    console.log(`   userId: ${profile?.userId}`);
    console.log(`   isActive: ${profile?.isActive}`);
    console.log(`   name: ${profile?.name}`);
  } else {
    console.log("\n⚠️ Shipper has no shipperProfileId!");
  }

  // 3. Generate test token
  console.log("\n🔑 GENERATING TEST TOKEN...");
  const token = jwt.sign({ userId: shipper._id.toString() }, JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...`);

  // 4. Test API calls
  console.log("\n📡 TESTING API CALLS...");

  try {
    // Test /users/me
    console.log("\n1. GET /users/me");
    const meRes = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log(`   Status: ${meRes.status}`);
    console.log(`   shipperProfileId: ${meData.data?.user?.shipperProfileId}`);
    console.log(`   isShipper: ${meData.data?.user?.isShipper}`);

    // Test /delivery-checkins/shipper
    console.log("\n2. GET /delivery-checkins/shipper");
    const checkinsRes = await fetch(`${API_URL}/delivery-checkins/shipper`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkinsData = await checkinsRes.json();
    console.log(`   Status: ${checkinsRes.status}`);
    console.log(`   Success: ${checkinsData.success}`);
    if (checkinsData.success) {
      console.log(`   Checkins count: ${checkinsData.data?.checkins?.length}`);
    } else {
      console.log(`   Error: ${checkinsData.message}`);
    }

    // Test /delivery-checkins/assigned-orders
    console.log("\n3. GET /delivery-checkins/assigned-orders");
    const ordersRes = await fetch(
      `${API_URL}/delivery-checkins/assigned-orders`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const ordersData = await ordersRes.json();
    console.log(`   Status: ${ordersRes.status}`);
    console.log(`   Success: ${ordersData.success}`);
    if (ordersData.success) {
      console.log(`   Orders count: ${ordersData.data?.orders?.length}`);
    } else {
      console.log(`   Error: ${ordersData.message}`);
    }
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}`);
    console.log(
      "   Note: Make sure the backend server is running on port 3001"
    );
  }

  await mongoose.disconnect();
  console.log("\n✅ Test complete");
}

testShipperAPI();
