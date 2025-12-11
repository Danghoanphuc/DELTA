// apps/customer-backend/src/scripts/seed-real-user-data.js
/**
 * Seed Real Data for Actual Users
 *
 * Tạo dữ liệu thực cho:
 * - Customer: phucdh911@gmail.com
 * - Admin: phuc@printz.vn
 *
 * Usage: node --experimental-vm-modules src/scripts/seed-real-user-data.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

// HCM City locations
const HCM_LOCATIONS = [
  { name: "Quận 1", coords: [106.6953, 10.7769], address: "123 Nguyễn Huệ" },
  { name: "Quận 3", coords: [106.6833, 10.7833], address: "456 Võ Văn Tần" },
  {
    name: "Quận 7",
    coords: [106.7219, 10.7333],
    address: "789 Nguyễn Văn Linh",
  },
  {
    name: "Quận 10",
    coords: [106.6585, 10.7726],
    address: "268 Lý Thường Kiệt",
  },
  {
    name: "Bình Thạnh",
    coords: [106.7167, 10.8],
    address: "321 Điện Biên Phủ",
  },
];

const PRODUCTS = [
  { name: "Premium Polo Shirt - Navy", price: 350000 },
  { name: "Custom T-Shirt - White", price: 200000 },
  { name: "Canvas Tote Bag", price: 150000 },
  { name: 'Laptop Sleeve 15"', price: 280000 },
  { name: "Ceramic Mug - Logo", price: 120000 },
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
    .substring(2, 6)
    .toUpperCase()}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedRealUserData() {
  try {
    log.info("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    log.success("Connected to MongoDB");

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
    console.log("🚀 SEEDING DATA FOR REAL USERS");
    console.log("=".repeat(60) + "\n");

    // ========================================
    // Find or Create Real Customer
    // ========================================
    const customerEmail = "phucdh911@gmail.com";
    log.info(`Finding/Creating customer: ${customerEmail}...`);

    let customer = await User.findOne({ email: customerEmail });

    if (!customer) {
      log.warn("Customer not found, creating new account...");

      // Check if username exists
      const existingUsername = await User.findOne({ username: "phucdh911" });
      const username = existingUsername
        ? `phucdh911_${Date.now()}`
        : "phucdh911";

      customer = new User({
        email: customerEmail,
        displayName: "Phuc DH",
        username,
        hashedPassword: "Customer@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });
      await customer.save();
      log.success(
        `Created customer: ${customerEmail} (Password: Customer@123)`
      );
    } else {
      log.success(
        `Found existing customer: ${customer.displayName || customer.email}`
      );
    }

    console.log(`   ID: ${customer._id}`);

    // ========================================
    // Find or Create Shipper
    // ========================================
    const shipperEmail = "danghoanphuc16@gmail.com";
    log.info(`Finding/Creating shipper: ${shipperEmail}...`);

    let shipper = await User.findOne({ email: shipperEmail });
    let shipperProfile;

    if (shipper) {
      shipperProfile = await ShipperProfile.findById(shipper.shipperProfileId);

      // Create shipper profile if not exists
      if (!shipperProfile) {
        log.warn("Shipper profile not found, creating...");
        shipperProfile = new ShipperProfile({
          userId: shipper._id,
          vehicleType: "motorbike",
          vehiclePlate: "59-X1 88888",
          phoneNumber: "0909888888",
          isActive: true,
          totalDeliveries: 0,
          rating: 5.0,
        });
        shipper.shipperProfileId = shipperProfile._id;
        await shipperProfile.save();
        await shipper.save();
        log.success("Created shipper profile");
      }

      log.success(
        `Found existing shipper: ${shipper.displayName || shipper.email}`
      );
    } else {
      log.warn("Shipper not found, creating new account...");

      // Check if username exists
      const existingUsername = await User.findOne({
        username: "danghoanphuc16",
      });
      const username = existingUsername
        ? `danghoanphuc16_${Date.now()}`
        : "danghoanphuc16";

      shipper = new User({
        email: shipperEmail,
        displayName: "Đặng Hoàn Phúc",
        username,
        hashedPassword: "Shipper@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });

      shipperProfile = new ShipperProfile({
        userId: shipper._id,
        vehicleType: "motorbike",
        vehiclePlate: "59-X1 88888",
        phoneNumber: "0909888888",
        isActive: true,
        totalDeliveries: 0,
        rating: 5.0,
      });

      shipper.shipperProfileId = shipperProfile._id;
      await shipper.save();
      await shipperProfile.save();
      log.success(`Created shipper: ${shipperEmail} (Password: Shipper@123)`);
    }

    console.log(`   Shipper ID: ${shipper._id}`);
    console.log(`   Shipper Name: ${shipper.displayName}`);

    // ========================================
    // Create Orders for Customer
    // ========================================
    log.info("Creating orders for customer...");

    const orders = [];
    const orderStatuses = [
      "completed",
      "completed",
      "completed",
      "shipping",
      "processing",
    ];

    for (let i = 0; i < orderStatuses.length; i++) {
      const status = orderStatuses[i];
      const location = HCM_LOCATIONS[i % HCM_LOCATIONS.length];
      const product1 = PRODUCTS[i % PRODUCTS.length];
      const product2 = PRODUCTS[(i + 1) % PRODUCTS.length];
      const qty1 = randomInt(2, 5);
      const qty2 = randomInt(1, 3);
      const totalPrice = product1.price * qty1 + product2.price * qty2;

      const order = new MasterOrder({
        orderNumber: generateOrderNumber(),
        customerId: customer._id,
        customerName: customer.displayName || "Khách hàng",
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
            printerTotalPrice: totalPrice,
            appliedCommissionRate: 0.1,
            commissionFee: totalPrice * 0.1,
            printerPayout: totalPrice * 0.9,
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
          recipientName: customer.displayName || "Khách hàng",
          phone: "0901234567",
          street: location.address,
          ward: "Phường " + randomInt(1, 15),
          district: location.name,
          city: "TP. Hồ Chí Minh",
          notes: randomItem(["Gọi trước khi giao", "Để ở bảo vệ", ""]),
          location: {
            type: "Point",
            coordinates: location.coords,
          },
        },
        totalAmount: qty1 + qty2,
        totalItems: qty1 + qty2,
        totalPrice: totalPrice,
        totalCommission: totalPrice * 0.1,
        totalPayout: totalPrice * 0.9,
        paymentStatus: "paid",
        paidAt: new Date(Date.now() - randomInt(7, 14) * 24 * 60 * 60 * 1000),
        masterStatus: status,
        assignedShipperId: status !== "processing" ? shipper._id : undefined,
        shipperAssignedAt:
          status !== "processing"
            ? new Date(Date.now() - randomInt(1, 5) * 24 * 60 * 60 * 1000)
            : undefined,
      });

      await order.save();
      orders.push({ order, location, status });
      log.success(`Created order: ${order.orderNumber} (${status})`);
    }

    // ========================================
    // Create Check-ins for Completed/Shipping Orders
    // ========================================
    log.info("Creating delivery check-ins...");

    const checkins = [];
    const deliveredOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "shipping"
    );

    for (const { order, location, status } of deliveredOrders) {
      const checkin = new DeliveryCheckin({
        orderId: order._id,
        orderNumber: order.orderNumber,
        shipperId: shipper._id,
        shipperName: shipper.displayName || "Shipper",
        customerId: customer._id,
        customerEmail: customer.email,
        location: {
          type: "Point",
          coordinates: [
            location.coords[0] + (Math.random() - 0.5) * 0.005,
            location.coords[1] + (Math.random() - 0.5) * 0.005,
          ],
        },
        address: {
          formatted: `${location.address}, ${location.name}, TP. Hồ Chí Minh`,
          street: location.address,
          ward: "Phường " + randomInt(1, 15),
          district: location.name,
          city: "TP. Hồ Chí Minh",
          country: "Vietnam",
        },
        gpsMetadata: {
          accuracy: randomInt(3, 10),
          altitude: randomInt(5, 15),
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
            size: randomInt(800000, 1500000),
            mimeType: "image/jpeg",
            width: 1920,
            height: 1080,
            uploadedAt: new Date(),
          },
          {
            url: `https://cdn.deltaswag.com/checkins/signature-${order._id}.jpg`,
            thumbnailUrl: `https://cdn.deltaswag.com/checkins/thumb-sig-${order._id}.jpg`,
            filename: `signature-${order._id}.jpg`,
            size: randomInt(300000, 500000),
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
      log.success(`Created check-in for: ${order.orderNumber}`);
    }

    // ========================================
    // Summary
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED DATA SUMMARY FOR REAL USER");
    console.log("=".repeat(60));

    console.log("\n👤 CUSTOMER:");
    console.log(`   Email: ${customer.email}`);
    console.log(`   Name:  ${customer.displayName || "N/A"}`);
    console.log(`   ID:    ${customer._id}`);

    console.log("\n🚚 SHIPPER:");
    console.log(`   Email: ${shipper.email}`);
    console.log(`   Name:  ${shipper.displayName}`);
    console.log(`   ID:    ${shipper._id}`);

    console.log("\n📦 ORDERS CREATED:");
    console.log(`   Total: ${orders.length}`);
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

    console.log("\n📍 CHECK-INS CREATED:");
    console.log(`   Total: ${checkins.length}`);

    console.log("\n📋 ORDER DETAILS:");
    for (const { order, status } of orders) {
      const icon =
        status === "completed" ? "✅" : status === "shipping" ? "🚚" : "⏳";
      console.log(
        `   ${icon} ${
          order.orderNumber
        } | ${status} | ${order.totalPrice.toLocaleString()} VND`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));

    console.log("\n📝 WHAT TO DO NEXT:");
    console.log("   1. Login as phucdh911@gmail.com to see orders");
    console.log("   2. Check delivery map to see check-in locations");
    console.log(
      "   3. Admin phuc@printz.vn can view all orders in admin panel"
    );
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

seedRealUserData();
