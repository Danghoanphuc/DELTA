// apps/customer-backend/src/scripts/test-api-orders.js
/**
 * Test API orders endpoint directly
 * This simulates what happens when user calls /orders/my-orders
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function testApiOrders() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );

    const customerEmail = "phucdh911@gmail.com";

    console.log("=".repeat(60));
    console.log("🔍 TESTING API ORDERS FLOW");
    console.log("=".repeat(60));

    // 1. Find user (simulating what passport does)
    console.log(`\n1️⃣ Finding user by email: ${customerEmail}`);
    const user = await User.findOne({ email: customerEmail }).lean();

    if (!user) {
      console.log("   ❌ User not found!");
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`   ✅ Found user:`);
    console.log(`      ID: ${user._id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Auth: ${user.authMethod}`);
    console.log(`      GoogleId: ${user.googleId || "None"}`);

    // 2. Query orders (simulating getMyOrders)
    console.log(`\n2️⃣ Querying orders with customerId: ${user._id}`);
    const orders = await MasterOrder.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log(`   ✅ Found ${orders.length} orders:`);
    orders.forEach((o) => {
      console.log(
        `      - ${o.orderNumber} | ${
          o.masterStatus
        } | ${o.totalPrice?.toLocaleString()} VND`
      );
    });

    // 3. Check if there are orders with different customerId but same email
    console.log(
      `\n3️⃣ Checking for orphaned orders (same email, different customerId):`
    );
    const orphanedOrders = await MasterOrder.find({
      customerEmail: customerEmail,
      customerId: { $ne: user._id },
    }).lean();

    if (orphanedOrders.length > 0) {
      console.log(`   ⚠️ Found ${orphanedOrders.length} orphaned orders!`);
      orphanedOrders.forEach((o) => {
        console.log(`      - ${o.orderNumber} | customerId: ${o.customerId}`);
      });

      console.log(`\n   🔧 Fixing orphaned orders...`);
      await MasterOrder.updateMany(
        { customerEmail: customerEmail },
        { $set: { customerId: user._id } }
      );
      console.log(`   ✅ Fixed!`);
    } else {
      console.log(`   ✅ No orphaned orders found`);
    }

    // 4. Final verification
    console.log(`\n4️⃣ Final verification:`);
    const finalOrders = await MasterOrder.find({
      customerId: user._id,
    }).countDocuments();
    console.log(`   Orders for user ${user._id}: ${finalOrders}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST COMPLETE");
    console.log("=".repeat(60));
    console.log(`\nIf you still don't see orders, check:`);
    console.log(`1. Are you logged in as ${customerEmail}?`);
    console.log(`2. Check browser console for API errors`);
    console.log(`3. Check network tab for /orders/my-orders response`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
    process.exit(0);
  }
}

testApiOrders();
