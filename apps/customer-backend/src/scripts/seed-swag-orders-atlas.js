// apps/customer-backend/src/scripts/seed-swag-orders-atlas.js
/**
 * Seed SwagOrders for Organization Dashboard - MongoDB Atlas
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Use MONGODB_CONNECTIONSTRING (Atlas) instead of MONGODB_URI (local)
const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
};

async function seedSwagOrders() {
  try {
    log.info("Connecting to MongoDB Atlas...");
    log.info(`URI: ${MONGODB_URI?.substring(0, 50)}...`);
    await mongoose.connect(MONGODB_URI);
    log.success("Connected to MongoDB Atlas");

    // Import models
    const { User } = await import("../shared/models/user.model.js");
    const { OrganizationProfile: Organization } = await import(
      "../modules/organizations/organization.model.js"
    );
    const { SwagOrder, SWAG_ORDER_STATUS } = await import(
      "../modules/swag-orders/swag-order.model.js"
    );
    const { SwagPack } = await import(
      "../modules/swag-packs/swag-pack.model.js"
    );
    const { Recipient } = await import(
      "../modules/recipients/recipient.model.js"
    );

    console.log("\n" + "=".repeat(60));
    console.log("🚀 SEEDING SWAG ORDERS FOR ORGANIZATION (ATLAS)");
    console.log("=".repeat(60) + "\n");

    const customerEmail = "phucdh911@gmail.com";

    // 1. Find user
    log.info(`Finding user: ${customerEmail}...`);
    let user = await User.findOne({ email: customerEmail });

    if (!user) {
      log.warn(`User ${customerEmail} not found, creating...`);
      user = new User({
        email: customerEmail,
        username: "phucdh911",
        displayName: "Phuc DH",
        isVerified: true,
        isActive: true,
        authMethod: "google",
      });
      await user.save();
      log.success(`Created user: ${user.email}`);
    } else {
      log.success(`Found user: ${user.displayName || user.email}`);
    }
    console.log(`   User ID: ${user._id}`);

    // 2. Find or create organization
    log.info("Finding/Creating organization...");
    let organization = await Organization.findOne({
      $or: [{ user: user._id }, { "teamMembers.userId": user._id }],
    });

    if (!organization) {
      log.warn("No organization found, creating one...");
      organization = new Organization({
        user: user._id,
        businessName: "Phuc's Company",
        contactEmail: customerEmail,
        teamMembers: [{ userId: user._id, role: "owner" }],
        isActive: true,
        isVerified: false,
        verificationStatus: "unverified",
      });
      await organization.save();

      // Link organization to user
      user.organizationProfileId = organization._id;
      await user.save();

      log.success(`Created organization: ${organization.businessName}`);
    } else {
      log.success(`Found organization: ${organization.businessName}`);

      // Ensure user has organizationProfileId
      if (!user.organizationProfileId) {
        user.organizationProfileId = organization._id;
        await user.save();
        log.success("Linked organization to user");
      }
    }
    console.log(`   Organization ID: ${organization._id}`);

    // 3. Find or create SwagPack
    log.info("Finding/Creating SwagPack...");
    let swagPack = await SwagPack.findOne({ organization: organization._id });

    if (!swagPack) {
      log.warn("No SwagPack found, creating one...");
      swagPack = new SwagPack({
        organization: organization._id,
        createdBy: user._id,
        name: "Welcome Kit 2024",
        description: "Bộ quà chào mừng nhân viên mới",
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            productName: "Premium Polo Shirt",
            productImage: "https://cdn.deltaswag.com/products/polo.jpg",
            quantity: 1,
            unitPrice: 350000,
            hasSize: true,
          },
          {
            product: new mongoose.Types.ObjectId(),
            productName: "Canvas Tote Bag",
            productImage: "https://cdn.deltaswag.com/products/tote.jpg",
            quantity: 1,
            unitPrice: 150000,
          },
          {
            product: new mongoose.Types.ObjectId(),
            productName: "Ceramic Mug",
            productImage: "https://cdn.deltaswag.com/products/mug.jpg",
            quantity: 1,
            unitPrice: 120000,
          },
        ],
        pricing: {
          unitPrice: 620000,
          bulkDiscounts: [],
        },
        status: "active",
        isPublished: true,
      });
      await swagPack.save();
      log.success(`Created SwagPack: ${swagPack.name}`);
    } else {
      log.success(`Found SwagPack: ${swagPack.name}`);
    }
    console.log(`   SwagPack ID: ${swagPack._id}`);

    // 4. Create Recipients
    log.info("Creating recipients...");
    const recipientData = [
      { firstName: "Nguyễn", lastName: "Văn A", email: "nguyen.a@company.com" },
      { firstName: "Trần", lastName: "Thị B", email: "tran.b@company.com" },
      { firstName: "Lê", lastName: "Văn C", email: "le.c@company.com" },
      { firstName: "Phạm", lastName: "Thị D", email: "pham.d@company.com" },
      { firstName: "Hoàng", lastName: "Văn E", email: "hoang.e@company.com" },
    ];

    const recipients = [];
    for (const data of recipientData) {
      let recipient = await Recipient.findOne({
        organization: organization._id,
        email: data.email,
      });

      if (!recipient) {
        recipient = new Recipient({
          organization: organization._id,
          ...data,
          phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
          address: {
            street: `${Math.floor(100 + Math.random() * 900)} Nguyễn Huệ`,
            ward: "Phường Bến Nghé",
            district: "Quận 1",
            city: "TP. Hồ Chí Minh",
            country: "Vietnam",
          },
          status: "active",
        });
        await recipient.save();
      }
      recipients.push(recipient);
    }
    log.success(`Created/Found ${recipients.length} recipients`);

    // 5. Create SwagOrders with different statuses
    log.info("Creating SwagOrders...");

    const orderStatuses = [
      { status: SWAG_ORDER_STATUS.DELIVERED, name: "Quà Tết 2024" },
      { status: SWAG_ORDER_STATUS.SHIPPED, name: "Welcome Kit Q4" },
      { status: SWAG_ORDER_STATUS.PROCESSING, name: "Birthday Gifts Nov" },
      { status: SWAG_ORDER_STATUS.PAID, name: "Team Building Gifts" },
      { status: SWAG_ORDER_STATUS.DRAFT, name: "Holiday Gifts 2024" },
    ];

    const createdOrders = [];

    for (let i = 0; i < orderStatuses.length; i++) {
      const { status, name } = orderStatuses[i];
      const orderNumber = `SW${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}${String(i + 1).padStart(5, "0")}`;

      // Check if order exists
      let order = await SwagOrder.findOne({ orderNumber });

      if (!order) {
        // Select random recipients for this order
        const orderRecipients = recipients.slice(
          0,
          Math.min(i + 2, recipients.length)
        );

        order = new SwagOrder({
          organization: organization._id,
          createdBy: user._id,
          orderNumber,
          name,
          description: `Đơn hàng ${name}`,
          swagPack: swagPack._id,
          packSnapshot: {
            name: swagPack.name,
            items: swagPack.items,
            unitPrice: swagPack.pricing?.unitPrice || 620000,
          },
          recipientShipments: orderRecipients.map((r, idx) => ({
            recipient: r._id,
            recipientInfo: {
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              phone: r.phone,
            },
            shippingAddress: r.address,
            shipmentStatus:
              status === SWAG_ORDER_STATUS.DELIVERED
                ? "delivered"
                : status === SWAG_ORDER_STATUS.SHIPPED
                ? "shipped"
                : status === SWAG_ORDER_STATUS.PROCESSING
                ? "processing"
                : "pending",
            trackingNumber:
              status === SWAG_ORDER_STATUS.SHIPPED ||
              status === SWAG_ORDER_STATUS.DELIVERED
                ? `VN${Date.now()}${idx}`
                : undefined,
            shippedAt:
              status === SWAG_ORDER_STATUS.SHIPPED ||
              status === SWAG_ORDER_STATUS.DELIVERED
                ? new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000)
                : undefined,
            deliveredAt:
              status === SWAG_ORDER_STATUS.DELIVERED
                ? new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000)
                : undefined,
          })),
          totalRecipients: orderRecipients.length,
          shippingMethod: "standard",
          shippingCost: orderRecipients.length * 30000,
          pricing: {
            packPrice: swagPack.pricing?.unitPrice || 620000,
            totalPacksCost:
              (swagPack.pricing?.unitPrice || 620000) * orderRecipients.length,
            shippingCost: orderRecipients.length * 30000,
            kittingFee: orderRecipients.length * 5000,
            tax: 0,
            discount: 0,
            total:
              (swagPack.pricing?.unitPrice || 620000) * orderRecipients.length +
              orderRecipients.length * 30000 +
              orderRecipients.length * 5000,
          },
          paymentStatus:
            status === SWAG_ORDER_STATUS.DRAFT ? "pending" : "paid",
          paidAt:
            status !== SWAG_ORDER_STATUS.DRAFT
              ? new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
              : undefined,
          status,
          notifyRecipients: true,
          customMessage: `Chúc mừng bạn nhận được ${name}!`,
          submittedAt:
            status !== SWAG_ORDER_STATUS.DRAFT
              ? new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
              : undefined,
          processedAt: [
            SWAG_ORDER_STATUS.PROCESSING,
            SWAG_ORDER_STATUS.SHIPPED,
            SWAG_ORDER_STATUS.DELIVERED,
          ].includes(status)
            ? new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
            : undefined,
          completedAt:
            status === SWAG_ORDER_STATUS.DELIVERED
              ? new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000)
              : undefined,
        });

        await order.save();
        log.success(`Created order: ${orderNumber} (${status})`);
      } else {
        log.warn(`Order ${orderNumber} already exists`);
      }

      createdOrders.push(order);
    }

    // 6. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(60));

    console.log(`\n👤 USER: ${customerEmail}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   organizationProfileId: ${user.organizationProfileId}`);
    console.log(
      `   Organization: ${organization.businessName} (${organization._id})`
    );

    console.log(`\n📦 SWAG PACK: ${swagPack.name}`);
    console.log(`   ID: ${swagPack._id}`);

    console.log(`\n👥 RECIPIENTS: ${recipients.length}`);

    console.log(`\n📋 SWAG ORDERS: ${createdOrders.length}`);
    for (const order of createdOrders) {
      const icon =
        order.status === "delivered"
          ? "✅"
          : order.status === "shipped"
          ? "🚚"
          : order.status === "processing"
          ? "⏳"
          : order.status === "paid"
          ? "💰"
          : "📝";
      console.log(
        `   ${icon} ${order.orderNumber} | ${order.status} | ${order.name}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 SWAG ORDERS SEEDED SUCCESSFULLY TO ATLAS!");
    console.log("=".repeat(60));

    console.log(`\n📝 NOW:`);
    console.log(`   1. Logout from current account`);
    console.log(`   2. Clear localStorage in browser`);
    console.log(`   3. Login with Google: ${customerEmail}`);
    console.log(
      `   4. Go to: http://localhost:5173/organization/dashboard?tab=swag-orders`
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

seedSwagOrders();
