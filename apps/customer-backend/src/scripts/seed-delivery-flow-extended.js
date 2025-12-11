// apps/customer-backend/src/scripts/seed-delivery-flow-extended.js
/**
 * Extended Seed Data for Full Delivery Flow Testing
 *
 * Tạo nhiều orders và check-ins với các trạng thái khác nhau:
 * - Multiple orders (pending, shipping, completed)
 * - Multiple check-ins at different locations
 * - Multiple shippers
 *
 * Usage: node --experimental-vm-modules src/scripts/seed-delivery-flow-extended.js
 * Clear:  node --experimental-vm-modules src/scripts/seed-delivery-flow-extended.js clear
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

// HCM City locations for realistic data
const HCM_LOCATIONS = [
  {
    name: "Quận 1",
    coords: [106.6953, 10.7769],
    address: "123 Nguyễn Huệ, Quận 1",
  },
  {
    name: "Quận 3",
    coords: [106.6833, 10.7833],
    address: "456 Võ Văn Tần, Quận 3",
  },
  {
    name: "Quận 7",
    coords: [106.7219, 10.7333],
    address: "789 Nguyễn Văn Linh, Quận 7",
  },
  {
    name: "Quận 10",
    coords: [106.6585, 10.7726],
    address: "268 Lý Thường Kiệt, Quận 10",
  },
  {
    name: "Bình Thạnh",
    coords: [106.7167, 10.8],
    address: "321 Điện Biên Phủ, Bình Thạnh",
  },
  {
    name: "Phú Nhuận",
    coords: [106.6833, 10.8],
    address: "654 Phan Xích Long, Phú Nhuận",
  },
  {
    name: "Tân Bình",
    coords: [106.65, 10.8167],
    address: "987 Cộng Hòa, Tân Bình",
  },
  {
    name: "Gò Vấp",
    coords: [106.6667, 10.8333],
    address: "147 Quang Trung, Gò Vấp",
  },
];

const PRODUCTS = [
  { name: "Premium Polo Shirt - Navy", price: 350000 },
  { name: "Custom T-Shirt - White", price: 200000 },
  { name: "Canvas Tote Bag", price: 150000 },
  { name: 'Laptop Sleeve 15"', price: 280000 },
  { name: "Ceramic Mug - Logo", price: 120000 },
  { name: "Notebook A5 - Custom", price: 85000 },
  { name: "Lanyard with ID Holder", price: 45000 },
  { name: "USB Flash Drive 32GB", price: 180000 },
];

const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
};

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 4)
    .toUpperCase()}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearData() {
  log.info("Clearing existing test data...");

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

  // Delete test users
  const testEmails = [
    "customer.test@deltaswag.com",
    "customer2.test@deltaswag.com",
    "shipper.test@deltaswag.com",
    "shipper2.test@deltaswag.com",
  ];

  for (const email of testEmails) {
    const user = await User.findOne({ email });
    if (user) {
      if (user.shipperProfileId) {
        await ShipperProfile.findByIdAndDelete(user.shipperProfileId);
      }
      await User.findByIdAndDelete(user._id);
    }
  }

  // Delete test orders (by customer email pattern)
  await MasterOrder.deleteMany({
    customerEmail: { $regex: /test@deltaswag\.com$/ },
  });

  // Delete test check-ins (by customer email pattern)
  await DeliveryCheckin.deleteMany({
    customerEmail: { $regex: /test@deltaswag\.com$/ },
  });

  log.success("Cleared existing test data");
}

async function seedExtendedData() {
  try {
    log.info("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    log.success("Connected to MongoDB");

    // Check for clear command
    if (process.argv[2] === "clear") {
      await clearData();
      await mongoose.disconnect();
      process.exit(0);
    }

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { ShipperProfile } = await import(
      "../shared/models/shipper-profile.model.js"
    );
    const { MasterOrder } = await import(
      "../shared/models/master-order.model.js"
    );
    const { DeliveryCheckin, CHECKIN_STATUS } = await import(
      "../modules/delivery-checkin/delivery-checkin.model.js"
    );

    console.log("\n" + "=".repeat(60));
    console.log("🚀 SEEDING EXTENDED DELIVERY FLOW DATA");
    console.log("=".repeat(60) + "\n");

    // Clear existing test data first
    await clearData();

    // ========================================
    // Create Customers
    // ========================================
    log.info("Creating customers...");

    const customers = [];
    const customerData = [
      {
        email: "customer.test@deltaswag.com",
        name: "Nguyễn Văn Khách",
        username: "customer_test",
      },
      {
        email: "customer2.test@deltaswag.com",
        name: "Trần Thị Hương",
        username: "customer2_test",
      },
    ];

    for (const data of customerData) {
      const customer = new User({
        email: data.email,
        displayName: data.name,
        username: data.username,
        hashedPassword: "Customer@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });
      await customer.save();
      customers.push(customer);
      log.success(`Created customer: ${data.email}`);
    }

    // ========================================
    // Create Shippers
    // ========================================
    log.info("Creating shippers...");

    const shippers = [];
    const shipperData = [
      {
        email: "shipper.test@deltaswag.com",
        name: "Lê Văn Giao",
        username: "shipper_test",
        plate: "59-X1 11111",
      },
      {
        email: "shipper2.test@deltaswag.com",
        name: "Phạm Minh Tài",
        username: "shipper2_test",
        plate: "59-X2 22222",
      },
    ];

    for (const data of shipperData) {
      // Check if username exists and generate unique one
      const existingUsername = await User.findOne({ username: data.username });
      const username = existingUsername
        ? `${data.username}_${Date.now()}`
        : data.username;

      const shipper = new User({
        email: data.email,
        displayName: data.name,
        username,
        hashedPassword: "Shipper@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });

      const profile = new ShipperProfile({
        userId: shipper._id,
        vehicleType: "motorbike",
        vehiclePlate: data.plate,
        phoneNumber: `090${randomInt(1000000, 9999999)}`,
        isActive: true,
        totalDeliveries: randomInt(10, 100),
        rating: (4 + Math.random()).toFixed(1),
      });

      shipper.shipperProfileId = profile._id;
      await shipper.save();
      await profile.save();
      shippers.push({ user: shipper, profile });
      log.success(`Created shipper: ${data.email}`);
    }

    // ========================================
    // Create Orders with Different Statuses
    // ========================================
    log.info("Creating orders...");

    const orders = [];
    const orderStatuses = [
      { status: "completed", count: 5 },
      { status: "shipping", count: 3 },
      { status: "processing", count: 2 },
    ];

    for (const { status, count } of orderStatuses) {
      for (let i = 0; i < count; i++) {
        const customer = randomItem(customers);
        const shipper = randomItem(shippers);
        const location = randomItem(HCM_LOCATIONS);
        const product1 = randomItem(PRODUCTS);
        const product2 = randomItem(PRODUCTS);
        const qty1 = randomInt(1, 10);
        const qty2 = randomInt(1, 5);

        const order = new MasterOrder({
          orderNumber: generateOrderNumber(),
          customerId: customer._id,
          customerName: customer.displayName,
          customerEmail: customer.email,
          printerOrders: [
            {
              printerProfileId: new mongoose.Types.ObjectId(),
              printerBusinessName: "Delta Print Shop",
              items: [
                {
                  productId: new mongoose.Types.ObjectId(),
                  productName: product1.name,
                  thumbnailUrl: `https://cdn.deltaswag.com/products/${product1.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}.jpg`,
                  quantity: qty1,
                  unitPrice: product1.price,
                  subtotal: product1.price * qty1,
                },
                {
                  productId: new mongoose.Types.ObjectId(),
                  productName: product2.name,
                  thumbnailUrl: `https://cdn.deltaswag.com/products/${product2.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}.jpg`,
                  quantity: qty2,
                  unitPrice: product2.price,
                  subtotal: product2.price * qty2,
                },
              ],
              printerTotalPrice: product1.price * qty1 + product2.price * qty2,
              appliedCommissionRate: 0.1,
              commissionFee:
                (product1.price * qty1 + product2.price * qty2) * 0.1,
              printerPayout:
                (product1.price * qty1 + product2.price * qty2) * 0.9,
              printerStatus:
                status === "completed"
                  ? "completed"
                  : status === "shipping"
                  ? "shipping"
                  : "printing",
              completedAt:
                status === "completed"
                  ? new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000)
                  : undefined,
            },
          ],
          shippingAddress: {
            recipientName: customer.displayName,
            phone: `090${randomInt(1000000, 9999999)}`,
            street: location.address.split(",")[0],
            ward: "Phường " + randomInt(1, 15),
            district: location.name,
            city: "TP. Hồ Chí Minh",
            notes: randomItem([
              "Gọi trước khi giao",
              "Để ở bảo vệ",
              "Giao giờ hành chính",
              "",
            ]),
            location: {
              type: "Point",
              coordinates: location.coords,
            },
          },
          totalAmount: qty1 + qty2,
          totalItems: qty1 + qty2,
          totalPrice: product1.price * qty1 + product2.price * qty2,
          totalCommission:
            (product1.price * qty1 + product2.price * qty2) * 0.1,
          totalPayout: (product1.price * qty1 + product2.price * qty2) * 0.9,
          paymentStatus: "paid",
          paidAt: new Date(Date.now() - randomInt(7, 14) * 24 * 60 * 60 * 1000),
          masterStatus: status,
          assignedShipperId:
            status !== "processing" ? shipper.user._id : undefined,
          shipperAssignedAt:
            status !== "processing"
              ? new Date(Date.now() - randomInt(1, 5) * 24 * 60 * 60 * 1000)
              : undefined,
        });

        await order.save();
        orders.push({ order, customer, shipper, location, status });
      }
    }
    log.success(`Created ${orders.length} orders`);

    // ========================================
    // Create Check-ins for Completed/Shipping Orders
    // ========================================
    log.info("Creating delivery check-ins...");

    const checkins = [];
    const completedOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "shipping"
    );

    for (const {
      order,
      customer,
      shipper,
      location,
      status,
    } of completedOrders) {
      const checkin = new DeliveryCheckin({
        orderId: order._id,
        orderNumber: order.orderNumber,
        shipperId: shipper.user._id,
        shipperName: shipper.user.displayName,
        customerId: customer._id,
        customerEmail: customer.email,
        location: {
          type: "Point",
          coordinates: [
            location.coords[0] + (Math.random() - 0.5) * 0.01, // Slight variation
            location.coords[1] + (Math.random() - 0.5) * 0.01,
          ],
        },
        address: {
          formatted: `${location.address}, TP. Hồ Chí Minh`,
          street: location.address.split(",")[0],
          ward: "Phường " + randomInt(1, 15),
          district: location.name,
          city: "TP. Hồ Chí Minh",
          country: "Vietnam",
        },
        gpsMetadata: {
          accuracy: randomInt(3, 15),
          altitude: randomInt(5, 20),
          heading: randomInt(0, 360),
          speed: 0,
          timestamp: new Date(),
          source: "device",
        },
        photos: [
          {
            url: `https://cdn.deltaswag.com/checkins/delivery-${order._id}-1.jpg`,
            thumbnailUrl: `https://cdn.deltaswag.com/checkins/thumb-${order._id}-1.jpg`,
            filename: `delivery-${order._id}-1.jpg`,
            size: randomInt(800000, 2000000),
            mimeType: "image/jpeg",
            width: 1920,
            height: 1080,
            uploadedAt: new Date(),
          },
          {
            url: `https://cdn.deltaswag.com/checkins/signature-${order._id}.jpg`,
            thumbnailUrl: `https://cdn.deltaswag.com/checkins/thumb-sig-${order._id}.jpg`,
            filename: `signature-${order._id}.jpg`,
            size: randomInt(300000, 600000),
            mimeType: "image/jpeg",
            width: 800,
            height: 600,
            uploadedAt: new Date(),
          },
        ],
        notes: randomItem([
          "Đã giao hàng thành công. Người nhận đã ký xác nhận.",
          "Giao hàng OK. Khách hàng hài lòng.",
          "Đã giao tại bảo vệ tòa nhà theo yêu cầu.",
          "Giao thành công. Khách kiểm tra hàng đầy đủ.",
        ]),
        status:
          status === "completed"
            ? CHECKIN_STATUS.COMPLETED
            : CHECKIN_STATUS.PENDING,
        checkinAt: new Date(Date.now() - randomInt(0, 5) * 24 * 60 * 60 * 1000),
        emailSent: status === "completed",
        emailSentAt: status === "completed" ? new Date() : undefined,
      });

      await checkin.save();
      checkins.push(checkin);
    }
    log.success(`Created ${checkins.length} check-ins`);

    // ========================================
    // Summary
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 EXTENDED SEED DATA SUMMARY");
    console.log("=".repeat(60));

    console.log("\n👥 CUSTOMERS:");
    for (const c of customers) {
      console.log(`   📧 ${c.email} (Password: Customer@123)`);
    }

    console.log("\n🚚 SHIPPERS:");
    for (const s of shippers) {
      console.log(`   📧 ${s.user.email} (Password: Shipper@123)`);
    }

    console.log("\n📦 ORDERS:");
    console.log(
      `   ✅ Completed: ${
        orders.filter((o) => o.status === "completed").length
      }`
    );
    console.log(
      `   🚚 Shipping:  ${orders.filter((o) => o.status === "shipping").length}`
    );
    console.log(
      `   ⏳ Processing: ${
        orders.filter((o) => o.status === "processing").length
      }`
    );

    console.log("\n📍 CHECK-INS:");
    console.log(`   Total: ${checkins.length}`);
    console.log(
      `   Completed: ${
        checkins.filter((c) => c.status === CHECKIN_STATUS.COMPLETED).length
      }`
    );

    console.log("\n" + "=".repeat(60));
    console.log("🎉 EXTENDED DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));

    console.log("\n📝 TEST SCENARIOS:");
    console.log(
      "   1. Customer Map View: Login as customer to see delivery locations"
    );
    console.log(
      "   2. Shipper History: Login as shipper to see check-in history"
    );
    console.log("   3. Order Tracking: View orders at different statuses");
    console.log("   4. Geospatial Queries: Test location-based filtering");
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

seedExtendedData();
