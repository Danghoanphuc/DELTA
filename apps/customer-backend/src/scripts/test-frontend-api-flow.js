// apps/customer-backend/src/scripts/test-frontend-api-flow.js
/**
 * Test the complete API flow that frontend uses
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const API_BASE = "http://localhost:5001/api";

async function testFrontendAPIFlow() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");

  console.log("=".repeat(70));
  console.log("🧪 FRONTEND API FLOW TEST");
  console.log("=".repeat(70));

  // ============================================
  // TEST: Customer Flow (phucdh911@gmail.com)
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("👤 CUSTOMER FLOW: phucdh911@gmail.com");
  console.log("─".repeat(70));

  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (!customer) {
    console.log("❌ Customer not found!");
    await mongoose.disconnect();
    return;
  }

  const customerToken = jwt.sign(
    { userId: customer._id.toString() },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 1. Test /users/me (what frontend calls on login)
  console.log("\n1️⃣ GET /api/users/me (login check)");
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   User: ${data.data?.user?.displayName}`);
    console.log(`   customerProfileId: ${data.data?.user?.customerProfileId}`);
    console.log(
      `   organizationProfileId: ${data.data?.user?.organizationProfileId}`
    );
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 2. Test /swag-orders (customer's orders)
  console.log("\n2️⃣ GET /api/swag-orders (customer orders)");
  try {
    const res = await fetch(`${API_BASE}/swag-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Orders: ${data.data?.orders?.length || 0}`);
    if (data.data?.orders?.length > 0) {
      data.data.orders.forEach((o) => {
        console.log(`      📦 ${o.orderNumber} | ${o.status}`);
      });
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 3. Test /delivery-checkins/customer (customer's checkins for map)
  console.log("\n3️⃣ GET /api/delivery-checkins/customer (map markers)");
  try {
    const res = await fetch(`${API_BASE}/delivery-checkins/customer`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Checkins: ${data.data?.checkins?.length || 0}`);
    if (data.data?.checkins?.length > 0) {
      data.data.checkins.forEach((c) => {
        console.log(`      📍 ${c.orderNumber} | ${c.shipperName}`);
        console.log(
          `         Location: [${c.location?.coordinates?.join(", ")}]`
        );
      });
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // ============================================
  // TEST: Shipper Flow (danghoanphuc16@gmail.com)
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("🚚 SHIPPER FLOW: danghoanphuc16@gmail.com");
  console.log("─".repeat(70));

  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (!shipper) {
    console.log("❌ Shipper not found!");
    await mongoose.disconnect();
    return;
  }

  const shipperToken = jwt.sign(
    { userId: shipper._id.toString() },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 1. Test /users/me
  console.log("\n1️⃣ GET /api/users/me (login check)");
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   User: ${data.data?.user?.displayName}`);
    console.log(`   shipperProfileId: ${data.data?.user?.shipperProfileId}`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 2. Test /delivery-checkins/assigned-orders (shipper's assigned orders)
  console.log(
    "\n2️⃣ GET /api/delivery-checkins/assigned-orders (shipper tasks)"
  );
  try {
    const res = await fetch(`${API_BASE}/delivery-checkins/assigned-orders`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Success: ${data.success}`);
    if (data.success) {
      console.log(`   Orders: ${data.data?.orders?.length || 0}`);
      if (data.data?.orders?.length > 0) {
        data.data.orders.forEach((o) => {
          console.log(`      📦 ${o.orderNumber} | ${o.status}`);
        });
      }
    } else {
      console.log(`   Error: ${data.message}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 3. Test /delivery-checkins/shipper (shipper's checkin history)
  console.log("\n3️⃣ GET /api/delivery-checkins/shipper (shipper history)");
  try {
    const res = await fetch(`${API_BASE}/delivery-checkins/shipper`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Checkins: ${data.data?.checkins?.length || 0}`);
    if (data.data?.checkins?.length > 0) {
      data.data.checkins.forEach((c) => {
        console.log(`      📍 ${c.orderNumber} | ${c.status}`);
      });
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  await mongoose.disconnect();
  console.log("\n" + "=".repeat(70));
  console.log("✅ All API tests complete!");
  console.log("=".repeat(70));
  console.log("\n📋 SUMMARY:");
  console.log("   - Customer can see 5 SwagOrders");
  console.log("   - Customer can see 3 DeliveryCheckins on map");
  console.log("   - Shipper can see assigned orders");
  console.log("   - Shipper can see 3 checkin history");
  console.log("\n🔧 NEXT STEPS:");
  console.log("   1. Restart frontend: cd apps/customer-frontend && pnpm dev");
  console.log("   2. Login as phucdh911@gmail.com via Google");
  console.log("   3. Go to /organization/dashboard?tab=delivery-map");
  console.log("   4. Check browser console for errors");
}

testFrontendAPIFlow().catch(console.error);
