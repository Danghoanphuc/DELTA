// apps/customer-backend/src/scripts/final-data-check.js
/**
 * Final data verification script
 * Run this to verify all seeded data is correct
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function finalCheck() {
  console.log("🔍 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  const { User } = await import("../shared/models/user.model.js");
  const { ShipperProfile } = await import(
    "../shared/models/shipper-profile.model.js"
  );
  const { OrganizationProfile } = await import(
    "../modules/organizations/organization.model.js"
  );
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );
  const { DeliveryCheckin } = await import(
    "../modules/delivery-checkin/delivery-checkin.model.js"
  );

  console.log("=".repeat(70));
  console.log("📊 FINAL DATA VERIFICATION");
  console.log("=".repeat(70));

  // ============================================
  // CUSTOMER DATA
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("👤 CUSTOMER: phucdh911@gmail.com");
  console.log("─".repeat(70));

  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (!customer) {
    console.log("❌ Customer user NOT FOUND!");
  } else {
    console.log(`✅ User exists: ${customer._id}`);
    console.log(`   organizationProfileId: ${customer.organizationProfileId}`);

    if (customer.organizationProfileId) {
      const org = await OrganizationProfile.findById(
        customer.organizationProfileId
      );
      if (org) {
        console.log(`✅ Organization: ${org.businessName}`);

        const orders = await SwagOrder.find({
          organization: customer.organizationProfileId,
        });
        console.log(`✅ SwagOrders: ${orders.length}`);
        orders.forEach((o) => {
          console.log(`   📦 ${o.orderNumber} | ${o.status}`);
        });
      } else {
        console.log("❌ Organization NOT FOUND!");
      }
    } else {
      console.log("❌ User has no organizationProfileId!");
    }
  }

  // ============================================
  // SHIPPER DATA
  // ============================================
  console.log("\n" + "─".repeat(70));
  console.log("🚚 SHIPPER: danghoanphuc16@gmail.com");
  console.log("─".repeat(70));

  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (!shipper) {
    console.log("❌ Shipper user NOT FOUND!");
  } else {
    console.log(`✅ User exists: ${shipper._id}`);
    console.log(`   shipperProfileId: ${shipper.shipperProfileId}`);

    if (shipper.shipperProfileId) {
      const profile = await ShipperProfile.findById(shipper.shipperProfileId);
      if (profile) {
        console.log(`✅ ShipperProfile exists, isActive: ${profile.isActive}`);

        const checkins = await DeliveryCheckin.find({ shipperId: shipper._id });
        console.log(`✅ DeliveryCheckins: ${checkins.length}`);
        checkins.forEach((c) => {
          console.log(`   📍 ${c.orderNumber} | ${c.status}`);
        });
      } else {
        console.log("❌ ShipperProfile NOT FOUND!");
      }
    } else {
      console.log("❌ User has no shipperProfileId!");
    }
  }

  // ============================================
  // INSTRUCTIONS
  // ============================================
  console.log("\n" + "=".repeat(70));
  console.log("📋 INSTRUCTIONS");
  console.log("=".repeat(70));

  console.log(`
1. START BACKEND SERVER:
   cd apps/customer-backend
   pnpm dev
   
   Server will run on http://localhost:3001

2. START FRONTEND:
   cd apps/customer-frontend
   pnpm dev
   
   Frontend will run on http://localhost:5173

3. TEST CUSTOMER (SwagOrders):
   - Go to http://localhost:5173/signin
   - Login with Google: phucdh911@gmail.com
   - Navigate to /organization/dashboard?tab=swag-orders
   - You should see 5 orders

4. TEST SHIPPER (DeliveryCheckins):
   - Go to http://localhost:5173/signin
   - Login with Google: danghoanphuc16@gmail.com
   - Navigate to /shipper
   - You should see 3 checkins in history

5. TEST ADMIN:
   - Start admin backend: cd apps/admin-backend && pnpm dev
   - Start admin frontend: cd apps/admin-frontend && pnpm dev
   - Login to admin portal
   - Navigate to /swag-ops/orders
   - You should see 5 orders

TROUBLESHOOTING:
- If you don't see data, check browser console for API errors
- Make sure you're logged in with the correct account
- Verify the backend server is running
`);

  await mongoose.disconnect();
  console.log("✅ Verification complete\n");
}

finalCheck().catch(console.error);
