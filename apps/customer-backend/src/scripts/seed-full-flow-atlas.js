// apps/customer-backend/src/scripts/seed-full-flow-atlas.js
/**
 * Seed Full Flow Data for:
 * - Customer (phucdh911@gmail.com) - SwagOrders, MasterOrders
 * - Shipper (danghoanphuc16@gmail.com) - DeliveryCheckins
 * - Admin - Can see all orders
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
  { lat: 10.7769, lng: 106.7009, address: "123 Nguyễn Huệ, Q1" },
  { lat: 10.7628, lng: 106.6602, address: "456 Lê Văn Sỹ, Q3" },
  { lat: 10.8031, lng: 106.7144, address: "789 Điện Biên Phủ, Bình Thạnh" },
  { lat: 10.7867, lng: 106.695, address: "321 Hai Bà Trưng, Q1" },
  { lat: 10.7756, lng: 106.7019, address: "654 Đồng Khởi, Q1" },
];

async function seedFullFlow() {
  try {
    log.info("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    log.success("Connected to MongoDB Atlas");

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );

    // Define order statuses locally since they're not exported
    const ORDER_STATUS = {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      PROCESSING: "processing",
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };
    const { ShipperProfile } = await import(
      "../shared/models/shipper-profile.model.js"
    );
    const { DeliveryCheckin } = await import(
      "../modules/delivery-checkin/delivery-checkin.model.js"
    );
    const { OrganizationProfile } = await import(
      "../modules/organizations/organization.model.js"
    );
    const { SwagOrder, SWAG_ORDER_STATUS } = await import(
      "../modules/swag-orders/swag-order.model.js"
    );

    console.log("\n" + "=".repeat(60));
    console.log("🚀 SEEDING FULL FLOW DATA (ATLAS)");
    console.log("=".repeat(60) + "\n");

    // ========================================
    // 1. SETUP CUSTOMER
    // ========================================
    log.info("Setting up Customer: phucdh911@gmail.com...");

    let customer = await User.findOne({ email: "phucdh911@gmail.com" });
    if (!customer) {
      customer = new User({
        email: "phucdh911@gmail.com",
        username: "phucdh911",
        displayName: "Phuc DH",
        isVerified: true,
        isActive: true,
        authMethod: "google",
      });
      await customer.save();
      log.success("Created customer user");
    } else {
      log.success(`Found customer: ${customer.displayName}`);
    }

    // Ensure organization exists
    let organization = await OrganizationProfile.findOne({
      user: customer._id,
    });
    if (!organization) {
      organization = new OrganizationProfile({
        user: customer._id,
        businessName: `${customer.displayName}'s Company`,
        contactEmail: customer.email,
        teamMembers: [{ userId: customer._id, role: "owner" }],
        isActive: true,
        isVerified: false,
        verificationStatus: "unverified",
      });
      await organization.save();
      customer.organizationProfileId = organization._id;
      await customer.save();
      log.success("Created organization");
    }

    // ========================================
    // 2. SETUP SHIPPER
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
      shipper.shipperProfileId = shipperProfile._id;
      await shipper.save();
      log.success("Created shipper profile");
    }

    // ========================================
    // 3. CREATE MASTER ORDERS (for Customer & Admin)
    // ========================================
    log.info("Creating MasterOrders...");

    const orderStatuses = [
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PENDING,
    ];

    // First, check existing orders for this customer
    let existingOrders = await MasterOrder.find({
      customerId: customer._id,
    }).limit(5);

    const createdOrders = [];

    if (existingOrders.length >= 5) {
      log.success(`Found ${existingOrders.length} existing orders`);
      createdOrders.push(...existingOrders);
    } else {
      // Create new orders
      for (let i = 0; i < 5; i++) {
        const orderNumber = `ORD-${Date.now()}-${i + 1}`;
        const location = HCM_LOCATIONS[i % HCM_LOCATIONS.length];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = (Math.floor(Math.random() * 10) + 1) * 100000;

        const order = new MasterOrder({
          orderNumber,
          customerId: customer._id,
          customerEmail: customer.email,
          customerName: customer.displayName,
          customerPhone: "0901234567",
          items: [
            {
              productId: new mongoose.Types.ObjectId(),
              productName: `Sản phẩm ${i + 1}`,
              quantity,
              unitPrice,
              totalPrice: quantity * unitPrice,
            },
          ],
          shippingAddress: {
            fullName: customer.displayName,
            phone: "0901234567",
            street: location.address,
            ward: "Phường 1",
            district: "Quận 1",
            city: "TP. Hồ Chí Minh",
            location: {
              type: "Point",
              coordinates: [location.lng, location.lat],
            },
          },
          subtotal: 500000 + i * 100000,
          shippingFee: 30000,
          discount: 0,
          totalAmount: 530000 + i * 100000,
          paymentMethod: "cod",
          paymentStatus:
            orderStatuses[i] === ORDER_STATUS.DELIVERED ? "paid" : "pending",
          status: orderStatuses[i],
          notes: `Đơn hàng test ${i + 1}`,
        });

        await order.save();
        createdOrders.push(order);
        log.success(`Created order: ${orderNumber} (${orderStatuses[i]})`);
      }
    }

    // ========================================
    // 4. CREATE DELIVERY CHECKINS (for Shipper)
    // ========================================
    log.info("Creating DeliveryCheckins...");

    const deliveredOrders = createdOrders.filter((o) =>
      [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED].includes(o.status)
    );

    for (const order of deliveredOrders) {
      const location =
        HCM_LOCATIONS[Math.floor(Math.random() * HCM_LOCATIONS.length)];

      let checkin = await DeliveryCheckin.findOne({ orderId: order._id });
      if (!checkin) {
        checkin = new DeliveryCheckin({
          orderId: order._id,
          orderNumber: order.orderNumber,
          shipperId: shipperProfile._id,
          shipperUserId: shipper._id,
          customerId: customer._id,
          customerName: customer.displayName,
          customerPhone: "0901234567",
          deliveryAddress: order.shippingAddress,
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
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
            order.status === ORDER_STATUS.DELIVERED
              ? "delivered"
              : "in_transit",
          deliveredAt:
            order.status === ORDER_STATUS.DELIVERED ? new Date() : undefined,
          recipientName: customer.displayName,
          recipientSignature:
            order.status === ORDER_STATUS.DELIVERED
              ? "Đã nhận hàng"
              : undefined,
          notes: `Giao hàng cho đơn ${order.orderNumber}`,
        });
        await checkin.save();

        // Update shipper stats
        if (order.status === ORDER_STATUS.DELIVERED) {
          shipperProfile.stats.totalDeliveries += 1;
          shipperProfile.stats.successfulDeliveries += 1;
        }

        log.success(`Created checkin for order: ${order.orderNumber}`);
      }
    }

    await shipperProfile.save();

    // ========================================
    // 5. SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(60));

    console.log("\n👤 CUSTOMER: phucdh911@gmail.com");
    console.log(`   User ID: ${customer._id}`);
    console.log(`   Organization: ${organization.businessName}`);
    console.log(`   organizationProfileId: ${customer.organizationProfileId}`);

    console.log("\n🚚 SHIPPER: danghoanphuc16@gmail.com");
    console.log(`   User ID: ${shipper._id}`);
    console.log(`   Shipper Profile ID: ${shipperProfile._id}`);
    console.log(`   shipperProfileId: ${shipper.shipperProfileId}`);
    console.log(`   Total Deliveries: ${shipperProfile.stats.totalDeliveries}`);

    console.log("\n📦 MASTER ORDERS: " + createdOrders.length);
    createdOrders.forEach((o) => {
      const icon =
        o.status === "delivered"
          ? "✅"
          : o.status === "shipped"
          ? "🚚"
          : o.status === "processing"
          ? "⏳"
          : "📝";
      console.log(`   ${icon} ${o.orderNumber} | ${o.status}`);
    });

    const checkins = await DeliveryCheckin.find({
      shipperId: shipperProfile._id,
    });
    console.log("\n📍 DELIVERY CHECKINS: " + checkins.length);
    checkins.forEach((c) => {
      console.log(`   - ${c.orderNumber} | ${c.status}`);
    });

    // Check SwagOrders
    const swagOrders = await SwagOrder.find({ organization: organization._id });
    console.log("\n🎁 SWAG ORDERS: " + swagOrders.length);
    swagOrders.forEach((o) => {
      console.log(`   - ${o.orderNumber} | ${o.status} | ${o.name}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("🎉 FULL FLOW DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));

    console.log("\n📝 TEST INSTRUCTIONS:");
    console.log("\n1. CUSTOMER (phucdh911@gmail.com):");
    console.log("   - Login with Google");
    console.log(
      "   - Go to: /organization/dashboard?tab=swag-orders (SwagOrders)"
    );
    console.log("   - Go to: /my-orders (MasterOrders)");

    console.log("\n2. SHIPPER (danghoanphuc16@gmail.com):");
    console.log("   - Login with Google");
    console.log("   - Go to: /shipper (Shipper Portal)");
    console.log("   - Should see delivery checkins");

    console.log("\n3. ADMIN:");
    console.log("   - Login to admin panel");
    console.log("   - Should see all orders in Orders management");
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

seedFullFlow();
