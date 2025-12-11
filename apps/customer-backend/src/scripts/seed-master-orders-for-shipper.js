// apps/customer-backend/src/scripts/seed-master-orders-for-shipper.js
/**
 * Seed MasterOrders and assign shipper so they appear in shipper's assigned orders list
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function seedMasterOrdersForShipper() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");
  const { MasterOrder } = await import(
    "../shared/models/master-order.model.js"
  );

  console.log("=".repeat(70));
  console.log("📦 SEED MASTER ORDERS FOR SHIPPER");
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

  // Check existing MasterOrders assigned to shipper
  console.log("\n📦 Checking existing MasterOrders assigned to shipper...");
  const existingAssigned = await MasterOrder.find({
    assignedShipperId: shipper._id,
  }).lean();
  console.log(`   Existing assigned orders: ${existingAssigned.length}`);

  if (existingAssigned.length > 0) {
    console.log("   Already have assigned orders, skipping seed.");
    existingAssigned.forEach((o) => {
      console.log(`      📦 ${o.orderNumber} | ${o.masterStatus}`);
    });
    await mongoose.disconnect();
    return;
  }

  // Create MasterOrders for shipper
  console.log("\n🔄 Creating MasterOrders for shipper...");

  const ordersToCreate = [
    {
      orderNumber: "MO20251200001",
      customerId: customer._id,
      customerName: customer.displayName,
      customerEmail: customer.email,
      shippingAddress: {
        recipientName: customer.displayName,
        phone: "0901234567",
        street: "123 Nguyễn Huệ",
        ward: "Bến Nghé",
        district: "Quận 1",
        city: "Hồ Chí Minh",
        location: {
          type: "Point",
          coordinates: [106.7019, 10.7756], // District 1
        },
      },
      totalAmount: 500000,
      totalItems: 2,
      totalPrice: 500000,
      totalCommission: 50000,
      totalPayout: 450000,
      paymentStatus: "paid",
      paidAt: new Date(),
      masterStatus: "shipping",
      assignedShipperId: shipper._id,
      shipperAssignedAt: new Date(),
      printerOrders: [],
    },
    {
      orderNumber: "MO20251200002",
      customerId: customer._id,
      customerName: customer.displayName,
      customerEmail: customer.email,
      shippingAddress: {
        recipientName: "Nguyễn Văn A",
        phone: "0909876543",
        street: "456 Lê Lợi",
        ward: "Bến Thành",
        district: "Quận 1",
        city: "Hồ Chí Minh",
        location: {
          type: "Point",
          coordinates: [106.6602, 10.7628], // Ben Thanh
        },
      },
      totalAmount: 750000,
      totalItems: 3,
      totalPrice: 750000,
      totalCommission: 75000,
      totalPayout: 675000,
      paymentStatus: "paid",
      paidAt: new Date(),
      masterStatus: "processing",
      assignedShipperId: shipper._id,
      shipperAssignedAt: new Date(),
      printerOrders: [],
    },
    {
      orderNumber: "MO20251200003",
      customerId: customer._id,
      customerName: customer.displayName,
      customerEmail: customer.email,
      shippingAddress: {
        recipientName: "Trần Thị B",
        phone: "0912345678",
        street: "789 Hai Bà Trưng",
        ward: "Đa Kao",
        district: "Quận 1",
        city: "Hồ Chí Minh",
        location: {
          type: "Point",
          coordinates: [106.695, 10.7867], // Da Kao
        },
      },
      totalAmount: 300000,
      totalItems: 1,
      totalPrice: 300000,
      totalCommission: 30000,
      totalPayout: 270000,
      paymentStatus: "paid",
      paidAt: new Date(),
      masterStatus: "shipping",
      assignedShipperId: shipper._id,
      shipperAssignedAt: new Date(),
      printerOrders: [],
    },
  ];

  for (const orderData of ordersToCreate) {
    try {
      // Check if order already exists
      const existing = await MasterOrder.findOne({
        orderNumber: orderData.orderNumber,
      });
      if (existing) {
        console.log(
          `   ⏭️ Order ${orderData.orderNumber} already exists, updating...`
        );
        await MasterOrder.findByIdAndUpdate(existing._id, {
          assignedShipperId: shipper._id,
          shipperAssignedAt: new Date(),
          masterStatus: orderData.masterStatus,
          paymentStatus: "paid",
        });
        console.log(`   ✅ Updated ${orderData.orderNumber}`);
      } else {
        const order = new MasterOrder(orderData);
        await order.save();
        console.log(`   ✅ Created ${orderData.orderNumber}`);
      }
    } catch (err) {
      console.log(
        `   ❌ Error creating ${orderData.orderNumber}: ${err.message}`
      );
    }
  }

  // Verify
  console.log("\n🔍 Verifying assigned orders...");
  const assignedOrders = await MasterOrder.find({
    assignedShipperId: shipper._id,
    masterStatus: { $in: ["shipping", "processing"] },
    paymentStatus: "paid",
  }).lean();
  console.log(`   Orders assigned to shipper: ${assignedOrders.length}`);
  assignedOrders.forEach((o) => {
    console.log(
      `      📦 ${o.orderNumber} | ${o.masterStatus} | ${o.shippingAddress?.recipientName}`
    );
  });

  await mongoose.disconnect();
  console.log("\n✅ Done!");
}

seedMasterOrdersForShipper().catch(console.error);
