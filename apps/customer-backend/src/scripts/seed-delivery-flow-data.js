// apps/customer-backend/src/scripts/seed-delivery-flow-data.js
/**
 * Seed Mock Data for Full Delivery Flow
 *
 * Script này tạo dữ liệu thực vào database để test luồng delivery:
 * 1. Customer (người đặt hàng)
 * 2. Shipper (người giao hàng)
 * 3. MasterOrder (đơn hàng)
 * 4. DeliveryCheckin (check-in giao hàng)
 *
 * Usage: node --experimental-vm-modules src/scripts/seed-delivery-flow-data.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

// Colors for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (num, msg) =>
    console.log(`${colors.cyan}[${num}] ${msg}${colors.reset}`),
  data: (label, value) =>
    console.log(`   ${colors.magenta}${label}:${colors.reset} ${value}`),
};

async function seedDeliveryFlowData() {
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
    console.log("🚀 SEEDING DELIVERY FLOW DATA");
    console.log("=".repeat(60) + "\n");

    // ========================================
    // STEP 1: Create Customer
    // ========================================
    log.step(1, "Creating Customer Account...");

    const customerEmail = "customer.test@deltaswag.com";
    let customer = await User.findOne({ email: customerEmail });

    if (customer) {
      log.warn("Customer already exists, using existing account");
    } else {
      customer = new User({
        email: customerEmail,
        displayName: "Nguyễn Văn Khách",
        username: "customer_test",
        hashedPassword: "Customer@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });
      await customer.save();
      log.success("Created customer account");
    }

    log.data("Customer ID", customer._id);
    log.data("Email", customerEmail);

    // ========================================
    // STEP 2: Create Shipper
    // ========================================
    log.step(2, "Creating Shipper Account...");

    const shipperEmail = "shipper.test@deltaswag.com";
    let shipper = await User.findOne({ email: shipperEmail });
    let shipperProfile;

    if (shipper) {
      log.warn("Shipper already exists, using existing account");
      shipperProfile = await ShipperProfile.findById(shipper.shipperProfileId);
      if (!shipperProfile) {
        shipperProfile = new ShipperProfile({
          userId: shipper._id,
          vehicleType: "motorbike",
          vehiclePlate: "59-X1 99999",
          phoneNumber: "0909123456",
          isActive: true,
          totalDeliveries: 0,
          rating: 5.0,
        });
        shipper.shipperProfileId = shipperProfile._id;
        await shipperProfile.save();
        await shipper.save();
      }
    } else {
      // Check if username exists and generate unique one
      const existingUsername = await User.findOne({ username: "shipper_test" });
      const username = existingUsername
        ? `shipper_test_${Date.now()}`
        : "shipper_test";

      shipper = new User({
        email: shipperEmail,
        displayName: "Trần Văn Shipper",
        username,
        hashedPassword: "Shipper@123",
        authMethod: "local",
        isVerified: true,
        isActive: true,
      });

      shipperProfile = new ShipperProfile({
        userId: shipper._id,
        vehicleType: "motorbike",
        vehiclePlate: "59-X1 99999",
        phoneNumber: "0909123456",
        isActive: true,
        totalDeliveries: 0,
        rating: 5.0,
      });

      shipper.shipperProfileId = shipperProfile._id;
      await shipper.save();
      await shipperProfile.save();
      log.success("Created shipper account");
    }

    log.data("Shipper ID", shipper._id);
    log.data("Shipper Profile ID", shipperProfile._id);
    log.data("Email", shipperEmail);

    // ========================================
    // STEP 3: Create Master Order
    // ========================================
    log.step(3, "Creating Master Order...");

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    const masterOrder = new MasterOrder({
      orderNumber,
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
              productName: "Premium Polo Shirt - Navy Blue",
              thumbnailUrl: "https://cdn.deltaswag.com/products/polo-navy.jpg",
              quantity: 5,
              unitPrice: 350000,
              subtotal: 1750000,
            },
            {
              productId: new mongoose.Types.ObjectId(),
              productName: "Custom Tote Bag - Canvas",
              thumbnailUrl:
                "https://cdn.deltaswag.com/products/tote-canvas.jpg",
              quantity: 10,
              unitPrice: 150000,
              subtotal: 1500000,
            },
          ],
          printerTotalPrice: 3250000,
          appliedCommissionRate: 0.1,
          commissionFee: 325000,
          printerPayout: 2925000,
          printerStatus: "shipping",
        },
      ],
      shippingAddress: {
        recipientName: "Nguyễn Văn Khách",
        phone: "0901234567",
        street: "268 Lý Thường Kiệt",
        ward: "Phường 14",
        district: "Quận 10",
        city: "TP. Hồ Chí Minh",
        notes: "Gọi trước khi giao",
        location: {
          type: "Point",
          coordinates: [106.6585, 10.7726], // HCM coordinates
        },
      },
      customerNotes: "Giao trong giờ hành chính",
      totalAmount: 15,
      totalItems: 15,
      totalPrice: 3250000,
      totalCommission: 325000,
      totalPayout: 2925000,
      paymentStatus: "paid",
      paidAt: new Date(),
      masterStatus: "shipping",
      assignedShipperId: shipper._id,
      shipperAssignedAt: new Date(),
    });

    await masterOrder.save();
    log.success("Created master order");
    log.data("Order Number", orderNumber);
    log.data("Order ID", masterOrder._id);
    log.data("Total Price", `${masterOrder.totalPrice.toLocaleString()} VND`);

    // ========================================
    // STEP 4: Create Delivery Check-in
    // ========================================
    log.step(4, "Creating Delivery Check-in...");

    const checkin = new DeliveryCheckin({
      orderId: masterOrder._id,
      orderNumber: masterOrder.orderNumber,
      shipperId: shipper._id,
      shipperName: shipper.displayName,
      customerId: customer._id,
      customerEmail: customer.email,
      location: {
        type: "Point",
        coordinates: [106.6585, 10.7726], // Same as delivery address
      },
      address: {
        formatted: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
        street: "268 Lý Thường Kiệt",
        ward: "Phường 14",
        district: "Quận 10",
        city: "TP. Hồ Chí Minh",
        country: "Vietnam",
      },
      gpsMetadata: {
        accuracy: 5,
        altitude: 10,
        heading: 180,
        speed: 0,
        timestamp: new Date(),
        source: "device",
      },
      photos: [
        {
          url: "https://cdn.deltaswag.com/checkins/delivery-proof-001.jpg",
          thumbnailUrl: "https://cdn.deltaswag.com/checkins/thumb-001.jpg",
          filename: "delivery-proof-001.jpg",
          size: 1500000,
          mimeType: "image/jpeg",
          width: 1920,
          height: 1080,
          uploadedAt: new Date(),
        },
        {
          url: "https://cdn.deltaswag.com/checkins/signature-001.jpg",
          thumbnailUrl: "https://cdn.deltaswag.com/checkins/thumb-sig-001.jpg",
          filename: "signature-001.jpg",
          size: 500000,
          mimeType: "image/jpeg",
          width: 800,
          height: 600,
          uploadedAt: new Date(),
        },
      ],
      notes: "Đã giao hàng thành công. Người nhận: Anh Khách. Đã ký xác nhận.",
      status: CHECKIN_STATUS.COMPLETED,
      checkinAt: new Date(),
      emailSent: true,
      emailSentAt: new Date(),
    });

    await checkin.save();
    log.success("Created delivery check-in");
    log.data("Check-in ID", checkin._id);
    log.data("Status", checkin.status);
    log.data("Photos", `${checkin.photos.length} photos`);

    // ========================================
    // STEP 5: Update Order Status to Completed
    // ========================================
    log.step(5, "Updating Order Status to Completed...");

    masterOrder.masterStatus = "completed";
    masterOrder.printerOrders[0].printerStatus = "completed";
    masterOrder.printerOrders[0].completedAt = new Date();
    await masterOrder.save();

    log.success("Order marked as completed");

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED DATA SUMMARY");
    console.log("=".repeat(60));

    console.log("\n👤 CUSTOMER:");
    console.log(`   Email:    ${customerEmail}`);
    console.log(`   Password: Customer@123`);
    console.log(`   ID:       ${customer._id}`);

    console.log("\n🚚 SHIPPER:");
    console.log(`   Email:    ${shipperEmail}`);
    console.log(`   Password: Shipper@123`);
    console.log(`   ID:       ${shipper._id}`);

    console.log("\n📦 ORDER:");
    console.log(`   Number:   ${orderNumber}`);
    console.log(`   ID:       ${masterOrder._id}`);
    console.log(`   Status:   ${masterOrder.masterStatus}`);
    console.log(`   Total:    ${masterOrder.totalPrice.toLocaleString()} VND`);

    console.log("\n📍 CHECK-IN:");
    console.log(`   ID:       ${checkin._id}`);
    console.log(`   Status:   ${checkin.status}`);
    console.log(`   Location: ${checkin.address.formatted}`);
    console.log(`   Photos:   ${checkin.photos.length}`);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DELIVERY FLOW DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));

    console.log("\n📝 NEXT STEPS:");
    console.log("   1. Login as Customer to view delivery map");
    console.log("   2. Login as Shipper to view check-in history");
    console.log("   3. Run E2E tests to verify the flow");
    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run
seedDeliveryFlowData();
