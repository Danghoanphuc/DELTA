// apps/customer-backend/src/scripts/test-customer-checkins-api.js
/**
 * Test customer checkins API endpoint
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const API_BASE = "http://localhost:5001/api";

async function testCustomerCheckinsAPI() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");

  console.log("=".repeat(70));
  console.log("🧪 CUSTOMER CHECKINS API TEST");
  console.log("=".repeat(70));

  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (!customer) {
    console.log("❌ Customer user not found!");
    await mongoose.disconnect();
    return;
  }

  console.log(`✅ Found customer: ${customer._id}`);
  console.log(`   organizationProfileId: ${customer.organizationProfileId}`);

  // Generate token
  const customerToken = jwt.sign(
    { userId: customer._id.toString() },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Test /delivery-checkins/customer
  console.log("\n📡 Calling GET /api/delivery-checkins/customer...");
  try {
    const res = await fetch(`${API_BASE}/delivery-checkins/customer`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Success: ${data.success}`);
    if (data.success) {
      const checkins = data.data?.checkins || [];
      console.log(`   Checkins count: ${checkins.length}`);
      checkins.forEach((c) => {
        console.log(
          `      📍 ${c.orderNumber} | ${c.status} | shipper: ${c.shipperName}`
        );
        console.log(
          `         Location: [${c.location?.coordinates?.join(", ")}]`
        );
      });
    } else {
      console.log(`   Error: ${data.message}`);
      console.log(`   Full response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  await mongoose.disconnect();
  console.log("\n✅ Test complete");
}

testCustomerCheckinsAPI().catch(console.error);
