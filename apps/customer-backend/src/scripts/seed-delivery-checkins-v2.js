// apps/customer-backend/src/scripts/seed-delivery-checkins-v2.js
/**
 * Seed Delivery Check-ins with Polymorphic Reference
 *
 * Creates test data with proper orderType and orderModel fields.
 *
 * Run: node --experimental-vm-modules src/scripts/seed-delivery-checkins-v2.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

// Constants
const ORDER_TYPES = {
  SWAG: "swag",
  MASTER: "master",
};

const ORDER_TYPE_TO_MODEL = {
  [ORDER_TYPES.SWAG]: "SwagOrder",
  [ORDER_TYPES.MASTER]: "MasterOrder",
};

const CHECKIN_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

async function seedDeliveryCheckins() {
  console.log("=".repeat(70));
  console.log("🌱 SEED: Delivery Check-ins (Polymorphic Reference)");
  console.log("=".repeat(70));

  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // Import models
  const { User } = await import("../shared/models/user.model.js");
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );
  const { DeliveryCheckin } = await import(
    "../modules/delivery-checkin/delivery-checkin.model.js"
  );

  // Find users
  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });

  if (!customer || !shipper) {
    console.log("❌ Required users not found!");
    console.log(`   Customer: ${customer ? "✅" : "❌"}`);
    console.log(`   Shipper: ${shipper ? "✅" : "❌"}`);
    await mongoose.disconnect();
    return;
  }

  console.log(`✅ Customer: ${customer.displayName} (${customer._id})`);
  console.log(`✅ Shipper: ${shipper.displayName} (${shipper._id})`);

  // Find SwagOrders
  const swagOrders = await SwagOrder.find({
    organization: customer.organizationProfileId,
    status: { $in: ["processing", "shipped", "delivered"] },
  }).lean();

  console.log(`\n📦 Found ${swagOrders.length} SwagOrders for check-in`);

  if (swagOrders.length === 0) {
    console.log("❌ No SwagOrders found. Run seed-swag-orders-atlas.js first.");
    await mongoose.disconnect();
    return;
  }

  // Delete existing check-ins for these orders
  console.log("\n🗑️ Cleaning existing check-ins...");
  const deleteResult = await DeliveryCheckin.deleteMany({
    orderId: { $in: swagOrders.map((o) => o._id) },
  });
  console.log(`   Deleted: ${deleteResult.deletedCount}`);

  // Create check-ins with polymorphic reference
  console.log("\n🌱 Creating check-ins...");

  const locations = [
    {
      lng: 106.7019,
      lat: 10.7756,
      address: "123 Nguyễn Huệ, Bến Nghé, Quận 1, HCM",
    },
    {
      lng: 106.6602,
      lat: 10.7628,
      address: "456 Lê Lợi, Bến Thành, Quận 1, HCM",
    },
    {
      lng: 106.695,
      lat: 10.7867,
      address: "789 Hai Bà Trưng, Đa Kao, Quận 1, HCM",
    },
  ];

  const checkinsToCreate = swagOrders.slice(0, 3).map((order, index) => {
    const loc = locations[index % locations.length];

    return {
      // Polymorphic reference fields
      orderType: ORDER_TYPES.SWAG,
      orderModel: ORDER_TYPE_TO_MODEL[ORDER_TYPES.SWAG],
      orderId: order._id,
      orderNumber: order.orderNumber,

      // Shipper info
      shipperId: shipper._id,
      shipperName: shipper.displayName,

      // Customer info (denormalized)
      customerId: customer._id,
      customerEmail: customer.email,

      // Location
      location: {
        type: "Point",
        coordinates: [loc.lng, loc.lat],
      },

      // Address
      address: {
        formatted: loc.address,
        street: loc.address.split(",")[0],
        ward: loc.address.split(",")[1]?.trim(),
        district: "Quận 1",
        city: "Hồ Chí Minh",
        country: "Vietnam",
      },

      // GPS Metadata
      gpsMetadata: {
        accuracy: 10 + Math.random() * 20,
        altitude: 5 + Math.random() * 10,
        heading: Math.random() * 360,
        speed: 0,
        timestamp: new Date(),
        source: "device",
      },

      // Photos (placeholder)
      photos: [
        {
          url: `https://picsum.photos/seed/${order.orderNumber}/800/600`,
          thumbnailUrl: `https://picsum.photos/seed/${order.orderNumber}/200/150`,
          filename: `delivery_${order.orderNumber}.jpg`,
          size: 150000,
          mimeType: "image/jpeg",
          width: 800,
          height: 600,
          uploadedAt: new Date(),
        },
      ],

      // Notes
      notes: `Đã giao hàng thành công cho đơn ${order.orderNumber}`,

      // Status
      status: index === 0 ? CHECKIN_STATUS.COMPLETED : CHECKIN_STATUS.PENDING,
      checkinAt: new Date(Date.now() - index * 3600000), // Stagger by 1 hour

      // Notification
      emailSent: index === 0,
      emailSentAt: index === 0 ? new Date() : undefined,
    };
  });

  for (const data of checkinsToCreate) {
    try {
      const checkin = new DeliveryCheckin(data);
      await checkin.save();
      console.log(
        `   ✅ Created check-in for ${data.orderNumber} (${data.orderType})`
      );
    } catch (error) {
      console.log(
        `   ❌ Failed to create check-in for ${data.orderNumber}: ${error.message}`
      );
    }
  }

  // Verify
  console.log("\n📊 Verification:");
  const totalCheckins = await DeliveryCheckin.countDocuments({
    isDeleted: false,
  });
  const byType = await DeliveryCheckin.countByOrderType();

  console.log(`   Total check-ins: ${totalCheckins}`);
  console.log(`   By order type:`);
  byType.forEach((t) => {
    console.log(`      ${t._id}: ${t.count}`);
  });

  await mongoose.disconnect();
  console.log("\n✅ Seed complete!");
}

seedDeliveryCheckins().catch(console.error);
