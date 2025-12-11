// apps/customer-backend/src/scripts/assign-shipper-to-orders.js
/**
 * Assign shipper to SwagOrders so they appear in shipper's assigned orders list
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function assignShipperToOrders() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );
  const { MasterOrder } = await import(
    "../shared/models/master-order.model.js"
  );

  console.log("=".repeat(70));
  console.log("🚚 ASSIGN SHIPPER TO ORDERS");
  console.log("=".repeat(70));

  // Find shipper
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (!shipper) {
    console.log("❌ Shipper not found!");
    await mongoose.disconnect();
    return;
  }
  console.log(`\n✅ Found shipper: ${shipper.displayName} (${shipper._id})`);

  // Find customer
  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (!customer) {
    console.log("❌ Customer not found!");
    await mongoose.disconnect();
    return;
  }
  console.log(`✅ Found customer: ${customer.displayName} (${customer._id})`);

  // Check if MasterOrder exists
  console.log("\n📦 Checking MasterOrder collection...");
  const masterOrderCount = await MasterOrder.countDocuments();
  console.log(`   MasterOrder count: ${masterOrderCount}`);

  // Check SwagOrder
  console.log("\n📦 Checking SwagOrder collection...");
  const swagOrders = await SwagOrder.find({
    organization: customer.organizationProfileId,
  }).lean();
  console.log(`   SwagOrder count: ${swagOrders.length}`);

  if (swagOrders.length === 0) {
    console.log("❌ No SwagOrders found for customer!");
    await mongoose.disconnect();
    return;
  }

  // Check if SwagOrder has assignedShipperId field
  console.log("\n🔍 Checking SwagOrder schema...");
  const sampleOrder = swagOrders[0];
  console.log(`   Sample order fields: ${Object.keys(sampleOrder).join(", ")}`);
  console.log(
    `   Has assignedShipperId: ${sampleOrder.hasOwnProperty(
      "assignedShipperId"
    )}`
  );

  // Update SwagOrders to assign shipper
  console.log("\n🔄 Assigning shipper to orders...");

  // Only assign to orders that are in shipping/processing status
  const ordersToAssign = swagOrders.filter((o) =>
    ["processing", "shipped", "delivered"].includes(o.status)
  );

  console.log(`   Orders to assign: ${ordersToAssign.length}`);

  for (const order of ordersToAssign) {
    try {
      const result = await SwagOrder.findByIdAndUpdate(
        order._id,
        {
          assignedShipperId: shipper._id,
          shipperAssignedAt: new Date(),
        },
        { new: true }
      );
      console.log(`   ✅ Assigned shipper to ${order.orderNumber}`);
    } catch (err) {
      console.log(
        `   ❌ Error assigning to ${order.orderNumber}: ${err.message}`
      );
    }
  }

  // Verify assignment
  console.log("\n🔍 Verifying assignments...");
  const assignedOrders = await SwagOrder.find({
    assignedShipperId: shipper._id,
  }).lean();
  console.log(`   Orders assigned to shipper: ${assignedOrders.length}`);
  assignedOrders.forEach((o) => {
    console.log(`      📦 ${o.orderNumber} | ${o.status}`);
  });

  await mongoose.disconnect();
  console.log("\n✅ Done!");
}

assignShipperToOrders().catch(console.error);
