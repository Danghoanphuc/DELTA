// apps/customer-backend/src/scripts/assign-orders-to-user.js
/**
 * Assign existing orders to a specific user
 *
 * Usage: node --experimental-vm-modules src/scripts/assign-orders-to-user.js <email>
 * Example: node --experimental-vm-modules src/scripts/assign-orders-to-user.js phucdh911@gmail.com
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function assignOrdersToUser() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.log(
      "Usage: node --experimental-vm-modules src/scripts/assign-orders-to-user.js <email>"
    );
    console.log(
      "Example: node --experimental-vm-modules src/scripts/assign-orders-to-user.js phucdh911@gmail.com"
    );
    process.exit(1);
  }

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

    // Find target user
    console.log(`🔍 Finding user: ${targetEmail}...`);
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`❌ User ${targetEmail} not found!`);
      console.log("\nAvailable users:");
      const users = await User.find({}).select("email displayName").lean();
      users.forEach((u) =>
        console.log(`   - ${u.email} (${u.displayName || "N/A"})`)
      );
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.displayName || user.email}`);
    console.log(`   ID: ${user._id}`);

    // Find orders with phucdh911@gmail.com
    const sourceEmail = "phucdh911@gmail.com";
    const orders = await MasterOrder.find({ customerEmail: sourceEmail });

    console.log(`\n📦 Found ${orders.length} orders to reassign`);

    if (orders.length === 0) {
      console.log("No orders to reassign. Run seed script first.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update orders
    console.log(`\n🔄 Reassigning orders to ${targetEmail}...`);

    for (const order of orders) {
      order.customerId = user._id;
      order.customerEmail = user.email;
      order.customerName = user.displayName || user.email;
      await order.save();
      console.log(`   ✅ ${order.orderNumber}`);
    }

    // Update check-ins
    const checkins = await DeliveryCheckin.find({ customerEmail: sourceEmail });
    console.log(`\n📍 Found ${checkins.length} check-ins to reassign`);

    for (const checkin of checkins) {
      checkin.customerId = user._id;
      checkin.customerEmail = user.email;
      await checkin.save();
      console.log(`   ✅ ${checkin.orderNumber}`);
    }

    // Verify
    console.log("\n" + "=".repeat(60));
    console.log("✅ REASSIGNMENT COMPLETE");
    console.log("=".repeat(60));

    const verifyOrders = await MasterOrder.find({
      customerId: user._id,
    }).countDocuments();
    const verifyCheckins = await DeliveryCheckin.find({
      customerId: user._id,
    }).countDocuments();

    console.log(`\n📊 User: ${user.email}`);
    console.log(`   Orders: ${verifyOrders}`);
    console.log(`   Check-ins: ${verifyCheckins}`);

    console.log("\n📝 Now login as this user to see the orders!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
    process.exit(0);
  }
}

assignOrdersToUser();
