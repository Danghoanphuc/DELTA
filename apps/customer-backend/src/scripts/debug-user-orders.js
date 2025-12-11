// apps/customer-backend/src/scripts/debug-user-orders.js
/**
 * Debug script to check why orders are not showing
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function debugUserOrders() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );
    const { DeliveryCheckin } = await import(
      "../modules/delivery-checkin/delivery-checkin.model.js"
    );

    const customerEmail = "phucdh911@gmail.com";
    const shipperEmail = "danghoanphuc16@gmail.com";

    console.log("=".repeat(60));
    console.log("🔍 DEBUG: USER ORDERS");
    console.log("=".repeat(60));

    // 1. Find customer
    console.log("\n👤 CUSTOMER:");
    const customer = await User.findOne({ email: customerEmail }).lean();
    if (customer) {
      console.log(`   Email: ${customer.email}`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   Display Name: ${customer.displayName}`);
    } else {
      console.log(`   ❌ Customer ${customerEmail} NOT FOUND!`);
    }

    // 2. Find shipper
    console.log("\n🚚 SHIPPER:");
    const shipper = await User.findOne({ email: shipperEmail }).lean();
    if (shipper) {
      console.log(`   Email: ${shipper.email}`);
      console.log(`   ID: ${shipper._id}`);
      console.log(`   Shipper Profile ID: ${shipper.shipperProfileId}`);
    } else {
      console.log(`   ❌ Shipper ${shipperEmail} NOT FOUND!`);
    }

    // 3. Find orders by customerId
    console.log("\n📦 ORDERS BY CUSTOMER ID:");
    if (customer) {
      const ordersByCustomerId = await MasterOrder.find({
        customerId: customer._id,
      })
        .select("orderNumber masterStatus customerEmail customerId totalPrice")
        .lean();

      console.log(`   Found: ${ordersByCustomerId.length} orders`);
      ordersByCustomerId.forEach((o) => {
        console.log(
          `   - ${o.orderNumber} | ${
            o.masterStatus
          } | ${o.totalPrice?.toLocaleString()} VND`
        );
        console.log(`     customerId: ${o.customerId}`);
      });
    }

    // 4. Find orders by customerEmail
    console.log("\n📦 ORDERS BY CUSTOMER EMAIL:");
    const ordersByEmail = await MasterOrder.find({
      customerEmail: customerEmail,
    })
      .select("orderNumber masterStatus customerEmail customerId totalPrice")
      .lean();

    console.log(`   Found: ${ordersByEmail.length} orders`);
    ordersByEmail.forEach((o) => {
      console.log(
        `   - ${o.orderNumber} | ${
          o.masterStatus
        } | ${o.totalPrice?.toLocaleString()} VND`
      );
      console.log(`     customerId: ${o.customerId}`);
    });

    // 5. Check if customerId matches
    console.log("\n🔍 CUSTOMER ID MATCH CHECK:");
    if (customer && ordersByEmail.length > 0) {
      const firstOrder = ordersByEmail[0];
      const customerIdStr = customer._id.toString();
      const orderCustomerIdStr = firstOrder.customerId?.toString();

      console.log(`   Customer._id: ${customerIdStr}`);
      console.log(`   Order.customerId: ${orderCustomerIdStr}`);
      console.log(
        `   Match: ${customerIdStr === orderCustomerIdStr ? "✅ YES" : "❌ NO"}`
      );
    }

    // 6. Find check-ins
    console.log("\n📍 CHECK-INS:");
    if (customer) {
      const checkins = await DeliveryCheckin.find({
        customerId: customer._id,
      })
        .select("orderNumber status shipperName checkinAt")
        .lean();

      console.log(`   Found: ${checkins.length} check-ins`);
      checkins.forEach((c) => {
        console.log(`   - ${c.orderNumber} | ${c.status} | ${c.shipperName}`);
      });
    }

    // 7. Find all orders in system
    console.log("\n📦 ALL ORDERS IN SYSTEM (last 10):");
    const allOrders = await MasterOrder.find({})
      .select("orderNumber masterStatus customerEmail customerId")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`   Total: ${allOrders.length}`);
    allOrders.forEach((o) => {
      console.log(
        `   - ${o.orderNumber} | ${o.masterStatus} | ${o.customerEmail}`
      );
    });

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
    process.exit(0);
  }
}

debugUserOrders();
