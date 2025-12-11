// apps/customer-backend/src/scripts/live-api-test.js
/**
 * Test live API with real token generation
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const API_BASE = "http://localhost:5001/api";

async function testLiveAPI() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");

  console.log("=".repeat(70));
  console.log("🧪 LIVE API TEST");
  console.log("=".repeat(70));

  // ============================================
  // TEST 1: Customer API
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("👤 TEST 1: CUSTOMER API (phucdh911@gmail.com)");
  console.log("─".repeat(70));

  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (!customer) {
    console.log("❌ Customer user not found in database!");
  } else {
    console.log(`✅ Found customer in DB: ${customer._id}`);
    console.log(`   organizationProfileId: ${customer.organizationProfileId}`);

    // Generate token
    const customerToken = jwt.sign(
      { userId: customer._id.toString() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Test /users/me
    console.log("\n📡 Calling GET /api/users/me...");
    try {
      const meRes = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const meData = await meRes.json();
      console.log(`   Status: ${meRes.status}`);
      console.log(`   Success: ${meData.success}`);
      if (meData.success) {
        console.log(`   User._id: ${meData.data?.user?._id}`);
        console.log(
          `   organizationProfileId: ${meData.data?.user?.organizationProfileId}`
        );
        console.log(
          `   shipperProfileId: ${meData.data?.user?.shipperProfileId}`
        );
      } else {
        console.log(`   Error: ${meData.message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test /swag-orders
    console.log("\n📡 Calling GET /api/swag-orders...");
    try {
      const ordersRes = await fetch(`${API_BASE}/swag-orders`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const ordersData = await ordersRes.json();
      console.log(`   Status: ${ordersRes.status}`);
      console.log(`   Success: ${ordersData.success}`);
      if (ordersData.success) {
        const orders = ordersData.data?.orders || [];
        console.log(`   Orders count: ${orders.length}`);
        orders.forEach((o) => {
          console.log(`      📦 ${o.orderNumber} | ${o.status}`);
        });
      } else {
        console.log(`   Error: ${ordersData.message}`);
        console.log(`   Full response: ${JSON.stringify(ordersData)}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  // ============================================
  // TEST 2: Shipper API
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("🚚 TEST 2: SHIPPER API (danghoanphuc16@gmail.com)");
  console.log("─".repeat(70));

  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (!shipper) {
    console.log("❌ Shipper user not found in database!");
  } else {
    console.log(`✅ Found shipper in DB: ${shipper._id}`);
    console.log(`   shipperProfileId: ${shipper.shipperProfileId}`);

    // Generate token
    const shipperToken = jwt.sign(
      { userId: shipper._id.toString() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Test /users/me
    console.log("\n📡 Calling GET /api/users/me...");
    try {
      const meRes = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });
      const meData = await meRes.json();
      console.log(`   Status: ${meRes.status}`);
      console.log(`   Success: ${meData.success}`);
      if (meData.success) {
        console.log(`   User._id: ${meData.data?.user?._id}`);
        console.log(
          `   shipperProfileId: ${meData.data?.user?.shipperProfileId}`
        );
      } else {
        console.log(`   Error: ${meData.message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test /delivery-checkins/shipper
    console.log("\n📡 Calling GET /api/delivery-checkins/shipper...");
    try {
      const checkinsRes = await fetch(`${API_BASE}/delivery-checkins/shipper`, {
        headers: { Authorization: `Bearer ${shipperToken}` },
      });
      const checkinsData = await checkinsRes.json();
      console.log(`   Status: ${checkinsRes.status}`);
      console.log(`   Success: ${checkinsData.success}`);
      if (checkinsData.success) {
        const checkins = checkinsData.data?.checkins || [];
        console.log(`   Checkins count: ${checkins.length}`);
        checkins.forEach((c) => {
          console.log(`      📍 ${c.orderNumber} | ${c.status}`);
        });
      } else {
        console.log(`   Error: ${checkinsData.message}`);
        console.log(`   Full response: ${JSON.stringify(checkinsData)}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log("\n✅ Test complete");
}

testLiveAPI().catch(console.error);
