// apps/customer-backend/src/scripts/verify-all-data-atlas.js
/**
 * Verify all seeded data in Atlas
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function verify() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas\n");

  const { User } = await import("../shared/models/user.model.js");
  const { ShipperProfile } = await import(
    "../shared/models/shipper-profile.model.js"
  );
  const { DeliveryCheckin } = await import(
    "../modules/delivery-checkin/delivery-checkin.model.js"
  );
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );
  const { OrganizationProfile } = await import(
    "../modules/organizations/organization.model.js"
  );

  console.log("=".repeat(60));
  console.log("📊 DATA VERIFICATION");
  console.log("=".repeat(60));

  // 1. Customer
  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n👤 CUSTOMER: phucdh911@gmail.com");
  console.log(`   User ID: ${customer?._id}`);
  console.log(`   organizationProfileId: ${customer?.organizationProfileId}`);

  if (customer?.organizationProfileId) {
    const org = await OrganizationProfile.findById(
      customer.organizationProfileId
    );
    console.log(`   Organization: ${org?.businessName}`);

    const swagOrders = await SwagOrder.find({
      organization: customer.organizationProfileId,
    });
    console.log(`   SwagOrders: ${swagOrders.length}`);
    swagOrders.forEach((o) =>
      console.log(`      - ${o.orderNumber} | ${o.status}`)
    );
  }

  // 2. Shipper
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  console.log("\n🚚 SHIPPER: danghoanphuc16@gmail.com");
  console.log(`   User ID: ${shipper?._id}`);
  console.log(`   shipperProfileId: ${shipper?.shipperProfileId}`);

  if (shipper?.shipperProfileId) {
    const profile = await ShipperProfile.findById(shipper.shipperProfileId);
    console.log(`   Profile exists: ${!!profile}`);
    console.log(`   Profile userId: ${profile?.userId}`);
  }

  // 3. DeliveryCheckins
  console.log("\n📍 DELIVERY CHECKINS:");
  const allCheckins = await DeliveryCheckin.find({});
  console.log(`   Total: ${allCheckins.length}`);

  if (shipper) {
    const shipperCheckins = await DeliveryCheckin.find({
      shipperId: shipper._id,
    });
    console.log(`   By shipper (user._id): ${shipperCheckins.length}`);
    shipperCheckins.forEach((c) => {
      console.log(
        `      - ${c.orderNumber} | ${c.status} | shipperId: ${c.shipperId}`
      );
    });
  }

  // 4. Check what shipperId values exist in checkins
  console.log("\n🔍 CHECKIN SHIPPER IDS:");
  const uniqueShipperIds = [
    ...new Set(allCheckins.map((c) => c.shipperId?.toString())),
  ];
  console.log(`   Unique shipperId values: ${uniqueShipperIds.join(", ")}`);
  console.log(`   Shipper user._id: ${shipper?._id}`);
  console.log(
    `   Match: ${uniqueShipperIds.includes(shipper?._id?.toString())}`
  );

  // 5. Admin - SwagOrders (admin sees all)
  console.log("\n👑 ADMIN VIEW:");
  const totalSwagOrders = await SwagOrder.countDocuments();
  console.log(`   Total SwagOrders: ${totalSwagOrders}`);
  const totalCheckins = await DeliveryCheckin.countDocuments();
  console.log(`   Total DeliveryCheckins: ${totalCheckins}`);

  await mongoose.disconnect();
  console.log("\n✅ Verification complete");
}

verify();
