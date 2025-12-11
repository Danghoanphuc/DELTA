// apps/customer-backend/src/scripts/verify-delivery-data.js
/**
 * Verify seeded delivery flow data in database
 *
 * Usage: node --experimental-vm-modules src/scripts/verify-delivery-data.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function verifyData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { ShipperProfile } = await import(
      "../shared/models/shipper-profile.model.js"
    );
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );
    const { DeliveryCheckin } = await import(
      "../modules/delivery-checkin/delivery-checkin.model.js"
    );

    console.log("=".repeat(60));
    console.log("📊 DATABASE VERIFICATION REPORT");
    console.log("=".repeat(60));

    // 1. Check test customers
    console.log("\n👥 TEST CUSTOMERS:");
    const customers = await User.find({
      email: { $regex: /test@deltaswag\.com$/ },
    })
      .select("email displayName _id")
      .lean();

    if (customers.length === 0) {
      console.log("   ⚠️  No test customers found");
    } else {
      for (const c of customers) {
        console.log(`   ✅ ${c.displayName} (${c.email})`);
        console.log(`      ID: ${c._id}`);
      }
    }

    // 2. Check test shippers
    console.log("\n🚚 TEST SHIPPERS:");
    const shippers = await User.find({
      email: { $regex: /test@deltaswag\.com$/ },
      shipperProfileId: { $exists: true },
    })
      .select("email displayName shipperProfileId _id")
      .lean();

    if (shippers.length === 0) {
      console.log("   ⚠️  No test shippers found");
    } else {
      for (const s of shippers) {
        const profile = await ShipperProfile.findById(
          s.shipperProfileId
        ).lean();
        console.log(`   ✅ ${s.displayName} (${s.email})`);
        console.log(`      ID: ${s._id}`);
        console.log(
          `      Vehicle: ${profile?.vehicleType} - ${profile?.vehiclePlate}`
        );
        console.log(`      Rating: ${profile?.rating} ⭐`);
      }
    }

    // 3. Check orders
    console.log("\n📦 ORDERS:");
    const orders = await MasterOrder.find({
      customerEmail: { $regex: /test@deltaswag\.com$/ },
    })
      .select(
        "orderNumber masterStatus totalPrice customerName assignedShipperId"
      )
      .lean();

    if (orders.length === 0) {
      console.log("   ⚠️  No test orders found");
    } else {
      const statusCounts = {};
      for (const o of orders) {
        statusCounts[o.masterStatus] = (statusCounts[o.masterStatus] || 0) + 1;
      }

      console.log(`   Total: ${orders.length} orders`);
      for (const [status, count] of Object.entries(statusCounts)) {
        const icon =
          status === "completed" ? "✅" : status === "shipping" ? "🚚" : "⏳";
        console.log(`   ${icon} ${status}: ${count}`);
      }

      console.log("\n   Recent Orders:");
      for (const o of orders.slice(0, 5)) {
        console.log(
          `   - ${o.orderNumber} | ${
            o.masterStatus
          } | ${o.totalPrice.toLocaleString()} VND`
        );
      }
    }

    // 4. Check check-ins
    console.log("\n📍 DELIVERY CHECK-INS:");
    const checkins = await DeliveryCheckin.find({
      customerEmail: { $regex: /test@deltaswag\.com$/ },
    })
      .select(
        "orderNumber status address.formatted photos checkinAt shipperName"
      )
      .lean();

    if (checkins.length === 0) {
      console.log("   ⚠️  No test check-ins found");
    } else {
      const statusCounts = {};
      for (const c of checkins) {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      }

      console.log(`   Total: ${checkins.length} check-ins`);
      for (const [status, count] of Object.entries(statusCounts)) {
        const icon = status === "completed" ? "✅" : "⏳";
        console.log(`   ${icon} ${status}: ${count}`);
      }

      console.log("\n   Recent Check-ins:");
      for (const c of checkins.slice(0, 5)) {
        console.log(`   - ${c.orderNumber} | ${c.status} | ${c.shipperName}`);
        console.log(`     📍 ${c.address?.formatted || "N/A"}`);
        console.log(`     📷 ${c.photos?.length || 0} photos`);
      }
    }

    // 5. Geospatial verification
    console.log("\n🗺️  GEOSPATIAL DATA:");
    const checkinsWithLocation = await DeliveryCheckin.find({
      customerEmail: { $regex: /test@deltaswag\.com$/ },
      "location.coordinates": { $exists: true },
    })
      .select("location address.district")
      .lean();

    console.log(`   Check-ins with GPS: ${checkinsWithLocation.length}`);

    const districts = [
      ...new Set(
        checkinsWithLocation.map((c) => c.address?.district).filter(Boolean)
      ),
    ];
    console.log(`   Districts covered: ${districts.join(", ")}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Shippers:  ${shippers.length}`);
    console.log(`   Orders:    ${orders.length}`);
    console.log(`   Check-ins: ${checkins.length}`);

    if (
      customers.length > 0 &&
      shippers.length > 0 &&
      orders.length > 0 &&
      checkins.length > 0
    ) {
      console.log("\n🎉 All test data is present and ready for testing!");
    } else {
      console.log("\n⚠️  Some test data is missing. Run seed scripts first:");
      console.log(
        "   node --experimental-vm-modules src/scripts/seed-delivery-flow-extended.js"
      );
    }

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

verifyData();
