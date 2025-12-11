// apps/customer-backend/src/scripts/seed-shipper-data-atlas.js
/**
 * Seed Shipper Data for danghoanphuc16@gmail.com
 * Creates DeliveryCheckins based on existing SwagOrders
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
};

// HCM City locations
const HCM_LOCATIONS = [
  { lat: 10.7769, lng: 106.7009 },
  { lat: 10.7628, lng: 106.6602 },
  { lat: 10.8031, lng: 106.7144 },
  { lat: 10.7867, lng: 106.695 },
  { lat: 10.7756, lng: 106.7019 },
];

async function seedShipperData() {
  try {
    log.info("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    log.success("Connected to MongoDB Atlas");

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { ShipperProfile } = await import(
      "../shared/models/shipper-profile.model.js"
    );
    const { DeliveryCheckin, CHECKIN_STATUS } = await import(
      "../modules/delivery-checkin/delivery-checkin.model.js"
    );
    const { SwagOrder } = await import(
      "../modules/swag-orders/swag-order.model.js"
    );
    const { OrganizationProfile } = await import(
      "../modules/organizations/organization.model.js"
    );

    console.log("\n" + "=".repeat(60));
    console.log("🚚 SEEDING SHIPPER DATA (ATLAS)");
    console.log("=".repeat(60) + "\n");

    // ========================================
    // 1. SETUP SHIPPER
    // ========================================
    log.info("Setting up Shipper: danghoanphuc16@gmail.com...");

    let shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
    if (!shipper) {
      shipper = new User({
        email: "danghoanphuc16@gmail.com",
        username: "danghoanphuc16",
        displayName: "Đặng Hoàn Phúc",
        isVerified: true,
        isActive: true,
        authMethod: "google",
      });
      await shipper.save();
      log.success("Created shipper user");
    } else {
      log.success(`Found shipper: ${shipper.displayName}`);
    }

    // Ensure shipper profile exists
    let shipperProfile = await ShipperProfile.findOne({ userId: shipper._id });
    if (!shipperProfile) {
      shipperProfile = new ShipperProfile({
        userId: shipper._id,
        fullName: shipper.displayName,
        phone: "0901234567",
        vehicleType: "motorbike",
        licensePlate: "59-A1 12345",
        isActive: true,
        isVerified: true,
        stats: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          rating: 5.0,
        },
      });
      await shipperProfile.save();
      log.success("Created shipper profile");
    }

    // Link shipper profile to user
    if (!shipper.shipperProfileId) {
      shipper.shipperProfileId = shipperProfile._id;
      await shipper.save();
      log.success("Linked shipper profile to user");
    }

    console.log(`   Shipper ID: ${shipper._id}`);
    console.log(`   Shipper Profile ID: ${shipperProfile._id}`);

    // ========================================
    // 2. GET CUSTOMER INFO
    // ========================================
    log.info("Getting customer info...");
    const customer = await User.findOne({ email: "phucdh911@gmail.com" });
    if (!customer) {
      log.error("Customer not found!");
      await mongoose.disconnect();
      return;
    }
    log.success(`Found customer: ${customer.displayName}`);

    const organization = await OrganizationProfile.findById(
      customer.organizationProfileId
    );
    if (!organization) {
      log.error("Organization not found!");
      await mongoose.disconnect();
      return;
    }

    // ========================================
    // 3. GET SWAG ORDERS
    // ========================================
    log.info("Getting SwagOrders...");
    const swagOrders = await SwagOrder.find({ organization: organization._id });
    log.success(`Found ${swagOrders.length} SwagOrders`);

    // ========================================
    // 4. CREATE DELIVERY CHECKINS
    // ========================================
    log.info("Creating DeliveryCheckins...");

    let checkinsCreated = 0;

    for (const order of swagOrders) {
      // Only create checkins for shipped/delivered orders
      if (!["shipped", "delivered", "processing"].includes(order.status)) {
        continue;
      }

      // Create checkin for each recipient shipment
      for (const shipment of order.recipientShipments || []) {
        const existingCheckin = await DeliveryCheckin.findOne({
          orderId: order._id,
          customerEmail: customer.email,
        });

        if (existingCheckin) {
          continue;
        }

        const location =
          HCM_LOCATIONS[Math.floor(Math.random() * HCM_LOCATIONS.length)];

        const street = shipment.shippingAddress?.street || "123 Nguyễn Huệ";
        const ward = shipment.shippingAddress?.ward || "Phường 1";
        const district = shipment.shippingAddress?.district || "Quận 1";
        const city = shipment.shippingAddress?.city || "TP. Hồ Chí Minh";
        const formattedAddress = `${street}, ${ward}, ${district}, ${city}`;

        const checkin = new DeliveryCheckin({
          orderId: order._id,
          orderNumber: order.orderNumber,
          shipperId: shipper._id,
          shipperName: shipper.displayName,
          customerId: customer._id,
          customerEmail: customer.email,
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          address: {
            formatted: formattedAddress,
            street,
            ward,
            district,
            city,
            country: "Vietnam",
          },
          gpsMetadata: {
            accuracy: 10,
            source: "device",
            timestamp: new Date(),
          },
          photos: [
            {
              url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
              thumbnailUrl:
                "https://res.cloudinary.com/demo/image/upload/c_thumb,w_200/sample.jpg",
              uploadedAt: new Date(),
            },
          ],
          status:
            order.status === "delivered"
              ? CHECKIN_STATUS.COMPLETED
              : CHECKIN_STATUS.PENDING,
          notes: `Giao hàng cho ${shipment.recipientInfo?.firstName || ""} ${
            shipment.recipientInfo?.lastName || ""
          } - Đơn ${order.orderNumber}`,
          checkinAt: new Date(),
          emailSent: true,
          emailSentAt: new Date(),
        });

        await checkin.save();
        checkinsCreated++;

        // Update shipper stats
        if (order.status === "delivered" && shipperProfile.stats) {
          shipperProfile.stats.totalDeliveries =
            (shipperProfile.stats.totalDeliveries || 0) + 1;
          shipperProfile.stats.successfulDeliveries =
            (shipperProfile.stats.successfulDeliveries || 0) + 1;
        }
      }
    }

    await shipperProfile.save();
    log.success(`Created ${checkinsCreated} DeliveryCheckins`);

    // ========================================
    // 5. SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(60));

    console.log("\n🚚 SHIPPER: danghoanphuc16@gmail.com");
    console.log(`   User ID: ${shipper._id}`);
    console.log(`   Shipper Profile ID: ${shipperProfile._id}`);
    console.log(`   shipperProfileId on User: ${shipper.shipperProfileId}`);
    console.log(
      `   Total Deliveries: ${shipperProfile.stats?.totalDeliveries || 0}`
    );

    const allCheckins = await DeliveryCheckin.find({ shipperId: shipper._id });
    console.log(`\n📍 DELIVERY CHECKINS: ${allCheckins.length}`);
    allCheckins.forEach((c) => {
      const icon = c.status === "completed" ? "✅" : "🚚";
      console.log(
        `   ${icon} ${c.orderNumber} | ${c.status} | ${
          c.address?.formatted || "N/A"
        }`
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("🎉 SHIPPER DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));

    console.log("\n📝 TEST INSTRUCTIONS:");
    console.log("1. Login with Google: danghoanphuc16@gmail.com");
    console.log("2. Go to: /shipper (Shipper Portal)");
    console.log("3. Should see delivery checkins and history");
    console.log("\n");
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedShipperData();
