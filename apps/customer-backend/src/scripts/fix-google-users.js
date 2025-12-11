// apps/customer-backend/src/scripts/fix-google-users.js
/**
 * Fix: Merge orders to Google OAuth users
 *
 * Problem: Script created users with authMethod: "local" but real users login with Google
 * Solution: Find Google users and assign orders to them
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function fixGoogleUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

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

    console.log("=".repeat(60));
    console.log("🔧 FIXING GOOGLE USERS DATA");
    console.log("=".repeat(60));

    // ========================================
    // 1. Find all users with these emails
    // ========================================
    const customerEmail = "phucdh911@gmail.com";
    const shipperEmail = "danghoanphuc16@gmail.com";

    console.log("\n📋 Finding all users with target emails...\n");

    const customerUsers = await User.find({ email: customerEmail }).lean();
    const shipperUsers = await User.find({ email: shipperEmail }).lean();

    console.log(`Customer users (${customerEmail}):`);
    customerUsers.forEach((u) => {
      console.log(
        `   - ID: ${u._id} | Auth: ${u.authMethod} | Name: ${u.displayName}`
      );
    });

    console.log(`\nShipper users (${shipperEmail}):`);
    shipperUsers.forEach((u) => {
      console.log(
        `   - ID: ${u._id} | Auth: ${u.authMethod} | Name: ${
          u.displayName
        } | ShipperProfile: ${u.shipperProfileId || "None"}`
      );
    });

    // ========================================
    // 2. Find or create Google users
    // ========================================
    console.log("\n🔍 Finding/Creating Google users...\n");

    // Customer
    let googleCustomer = customerUsers.find((u) => u.authMethod === "google");
    let localCustomer = customerUsers.find((u) => u.authMethod === "local");

    if (!googleCustomer) {
      console.log(`⚠️  No Google user found for ${customerEmail}`);
      console.log("   Creating Google user entry...");

      // Check if username exists
      const existingUsername = await User.findOne({
        username: "phucdh911_google",
      });
      const username = existingUsername
        ? `phucdh911_google_${Date.now()}`
        : "phucdh911_google";

      const newGoogleUser = new User({
        email: customerEmail,
        displayName: localCustomer?.displayName || "Phuc DH",
        username,
        authMethod: "google",
        googleId: `google_${Date.now()}`, // Placeholder - will be updated on real Google login
        isVerified: true,
        isActive: true,
      });
      await newGoogleUser.save();
      googleCustomer = newGoogleUser.toObject();
      console.log(`   ✅ Created Google user: ${googleCustomer._id}`);
    } else {
      console.log(`✅ Found Google customer: ${googleCustomer._id}`);
    }

    // Shipper
    let googleShipper = shipperUsers.find((u) => u.authMethod === "google");
    let localShipper = shipperUsers.find((u) => u.authMethod === "local");

    if (!googleShipper) {
      console.log(`⚠️  No Google user found for ${shipperEmail}`);
      console.log("   Creating Google user entry...");

      const existingUsername = await User.findOne({
        username: "danghoanphuc16_google",
      });
      const username = existingUsername
        ? `danghoanphuc16_google_${Date.now()}`
        : "danghoanphuc16_google";

      const newGoogleUser = new User({
        email: shipperEmail,
        displayName: localShipper?.displayName || "Đặng Hoàn Phúc",
        username,
        authMethod: "google",
        googleId: `google_${Date.now()}`,
        isVerified: true,
        isActive: true,
      });
      await newGoogleUser.save();
      googleShipper = newGoogleUser.toObject();
      console.log(`   ✅ Created Google user: ${googleShipper._id}`);
    } else {
      console.log(`✅ Found Google shipper: ${googleShipper._id}`);
    }

    // ========================================
    // 3. Create/Update Shipper Profile for Google shipper
    // ========================================
    console.log("\n🚚 Setting up shipper profile...");

    let shipperProfile = await ShipperProfile.findOne({
      userId: googleShipper._id,
    });

    if (!shipperProfile) {
      // Check if local shipper has profile
      if (localShipper?.shipperProfileId) {
        // Update existing profile to point to Google user
        shipperProfile = await ShipperProfile.findById(
          localShipper.shipperProfileId
        );
        if (shipperProfile) {
          shipperProfile.userId = googleShipper._id;
          await shipperProfile.save();
          console.log(`   ✅ Reassigned shipper profile to Google user`);
        }
      }

      if (!shipperProfile) {
        // Create new profile
        shipperProfile = new ShipperProfile({
          userId: googleShipper._id,
          vehicleType: "motorbike",
          vehiclePlate: "59-X1 88888",
          phoneNumber: "0909888888",
          isActive: true,
          totalDeliveries: 0,
          rating: 5.0,
        });
        await shipperProfile.save();
        console.log(`   ✅ Created new shipper profile`);
      }

      // Update Google user with shipper profile
      await User.findByIdAndUpdate(googleShipper._id, {
        shipperProfileId: shipperProfile._id,
      });
      console.log(`   ✅ Linked shipper profile to Google user`);
    } else {
      console.log(`   ✅ Shipper profile already exists`);
    }

    // ========================================
    // 4. Reassign all orders to Google customer
    // ========================================
    console.log("\n📦 Reassigning orders to Google customer...");

    const ordersToUpdate = await MasterOrder.find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: localCustomer?._id },
      ],
    });

    console.log(`   Found ${ordersToUpdate.length} orders to reassign`);

    for (const order of ordersToUpdate) {
      order.customerId = googleCustomer._id;
      order.customerEmail = googleCustomer.email;
      order.customerName = googleCustomer.displayName || googleCustomer.email;

      // Also update shipper assignment if needed
      if (order.assignedShipperId && localShipper) {
        if (
          order.assignedShipperId.toString() === localShipper._id.toString()
        ) {
          order.assignedShipperId = googleShipper._id;
        }
      }

      await order.save();
      console.log(`   ✅ ${order.orderNumber}`);
    }

    // ========================================
    // 5. Reassign all check-ins
    // ========================================
    console.log("\n📍 Reassigning check-ins...");

    const checkinsToUpdate = await DeliveryCheckin.find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: localCustomer?._id },
      ],
    });

    console.log(`   Found ${checkinsToUpdate.length} check-ins to reassign`);

    for (const checkin of checkinsToUpdate) {
      checkin.customerId = googleCustomer._id;
      checkin.customerEmail = googleCustomer.email;

      // Update shipper if needed
      if (checkin.shipperId && localShipper) {
        if (checkin.shipperId.toString() === localShipper._id.toString()) {
          checkin.shipperId = googleShipper._id;
          checkin.shipperName = googleShipper.displayName || "Shipper";
        }
      }

      await checkin.save();
      console.log(`   ✅ ${checkin.orderNumber}`);
    }

    // ========================================
    // 6. Clean up local users (optional)
    // ========================================
    console.log("\n🧹 Cleaning up duplicate local users...");

    if (
      localCustomer &&
      localCustomer._id.toString() !== googleCustomer._id.toString()
    ) {
      await User.findByIdAndDelete(localCustomer._id);
      console.log(`   ✅ Deleted local customer: ${localCustomer._id}`);
    }

    if (
      localShipper &&
      localShipper._id.toString() !== googleShipper._id.toString()
    ) {
      // Delete shipper profile if it wasn't reassigned
      if (localShipper.shipperProfileId) {
        const oldProfile = await ShipperProfile.findById(
          localShipper.shipperProfileId
        );
        if (
          oldProfile &&
          oldProfile.userId.toString() === localShipper._id.toString()
        ) {
          await ShipperProfile.findByIdAndDelete(localShipper.shipperProfileId);
          console.log(`   ✅ Deleted old shipper profile`);
        }
      }
      await User.findByIdAndDelete(localShipper._id);
      console.log(`   ✅ Deleted local shipper: ${localShipper._id}`);
    }

    // ========================================
    // 7. Verify
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ FIX COMPLETE - VERIFICATION");
    console.log("=".repeat(60));

    const finalCustomer = await User.findOne({
      email: customerEmail,
      authMethod: "google",
    }).lean();
    const finalShipper = await User.findOne({
      email: shipperEmail,
      authMethod: "google",
    }).lean();

    const customerOrders = await MasterOrder.find({
      customerId: finalCustomer?._id,
    }).countDocuments();
    const customerCheckins = await DeliveryCheckin.find({
      customerId: finalCustomer?._id,
    }).countDocuments();
    const shipperCheckins = await DeliveryCheckin.find({
      shipperId: finalShipper?._id,
    }).countDocuments();

    console.log(`\n👤 CUSTOMER (Google): ${customerEmail}`);
    console.log(`   ID: ${finalCustomer?._id}`);
    console.log(`   Orders: ${customerOrders}`);
    console.log(`   Check-ins: ${customerCheckins}`);

    console.log(`\n🚚 SHIPPER (Google): ${shipperEmail}`);
    console.log(`   ID: ${finalShipper?._id}`);
    console.log(`   Shipper Profile: ${finalShipper?.shipperProfileId}`);
    console.log(`   Check-ins (as shipper): ${shipperCheckins}`);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 NOW LOGIN WITH GOOGLE TO SEE YOUR DATA!");
    console.log("=".repeat(60));
    console.log(`\n   Customer: ${customerEmail} → See orders & delivery map`);
    console.log(`   Shipper: ${shipperEmail} → See check-in history`);
    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
    process.exit(0);
  }
}

fixGoogleUsers();
