// apps/admin-backend/src/scripts/test-admin-swag-api.ts
/**
 * Test admin swag-ops API access directly
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function testAdminSwagAPI() {
  if (!MONGODB_URI) {
    console.log("❌ MONGODB_CONNECTIONSTRING not set");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas\n");

  console.log("=".repeat(60));
  console.log("📊 ADMIN SWAG-OPS DATA CHECK");
  console.log("=".repeat(60));

  // 1. Check SwagOrders directly
  const SwagOrder = mongoose.model(
    "SwagOrder",
    new mongoose.Schema({}, { strict: false })
  );

  const swagOrders = await SwagOrder.find({}).lean();
  console.log(`\n📦 SWAG ORDERS: ${swagOrders.length}`);
  swagOrders.forEach((order: any) => {
    console.log(
      `   - ${order.orderNumber} | ${order.status} | org: ${order.organization}`
    );
  });

  // 2. Check Organizations
  const OrganizationProfile = mongoose.model(
    "OrganizationProfile",
    new mongoose.Schema({}, { strict: false })
  );

  const orgs = await OrganizationProfile.find({}).lean();
  console.log(`\n🏢 ORGANIZATIONS: ${orgs.length}`);
  orgs.forEach((org: any) => {
    console.log(`   - ${org._id} | ${org.businessName}`);
  });

  // 3. Check DeliveryCheckins
  const DeliveryCheckin = mongoose.model(
    "DeliveryCheckin",
    new mongoose.Schema({}, { strict: false })
  );

  const checkins = await DeliveryCheckin.find({}).lean();
  console.log(`\n📍 DELIVERY CHECKINS: ${checkins.length}`);
  checkins.forEach((checkin: any) => {
    console.log(
      `   - ${checkin.orderNumber} | ${checkin.status} | shipper: ${checkin.shipperId}`
    );
  });

  // 4. Check Users with shipper profile
  const User = mongoose.model(
    "User",
    new mongoose.Schema({}, { strict: false })
  );

  const shippers = await User.find({
    shipperProfileId: { $exists: true, $ne: null },
  }).lean();
  console.log(`\n🚚 SHIPPER USERS: ${shippers.length}`);
  shippers.forEach((user: any) => {
    console.log(
      `   - ${user.email} | shipperProfileId: ${user.shipperProfileId}`
    );
  });

  await mongoose.disconnect();
  console.log("\n✅ Check complete");
}

testAdminSwagAPI();
