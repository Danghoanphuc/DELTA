// apps/customer-backend/src/scripts/convert-to-google-auth.js
/**
 * Convert local users to Google auth so they can login with Google
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function convertToGoogleAuth() {
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
    console.log("🔧 CONVERTING USERS TO GOOGLE AUTH");
    console.log("=".repeat(60));

    const customerEmail = "phucdh911@gmail.com";
    const shipperEmail = "danghoanphuc16@gmail.com";

    // ========================================
    // 1. Convert Customer to Google Auth
    // ========================================
    console.log(`\n👤 Converting customer: ${customerEmail}`);

    const customer = await User.findOne({ email: customerEmail });
    if (customer) {
      customer.authMethod = "google";
      customer.googleId =
        customer.googleId || `google_placeholder_${Date.now()}`;
      customer.isVerified = true;
      customer.isActive = true;
      await customer.save();
      console.log(`   ✅ Converted to Google auth`);
      console.log(`   ID: ${customer._id}`);

      // Verify orders
      const orderCount = await MasterOrder.countDocuments({
        customerId: customer._id,
      });
      const checkinCount = await DeliveryCheckin.countDocuments({
        customerId: customer._id,
      });
      console.log(`   Orders: ${orderCount}`);
      console.log(`   Check-ins: ${checkinCount}`);
    } else {
      console.log(`   ❌ Customer not found!`);
    }

    // ========================================
    // 2. Convert Shipper to Google Auth
    // ========================================
    console.log(`\n🚚 Converting shipper: ${shipperEmail}`);

    const shipper = await User.findOne({ email: shipperEmail });
    if (shipper) {
      shipper.authMethod = "google";
      shipper.googleId = shipper.googleId || `google_placeholder_${Date.now()}`;
      shipper.isVerified = true;
      shipper.isActive = true;
      await shipper.save();
      console.log(`   ✅ Converted to Google auth`);
      console.log(`   ID: ${shipper._id}`);

      // Verify shipper profile
      if (shipper.shipperProfileId) {
        const profile = await ShipperProfile.findById(shipper.shipperProfileId);
        if (profile) {
          console.log(`   Shipper Profile: ${profile._id}`);
          console.log(
            `   Vehicle: ${profile.vehicleType} - ${profile.vehiclePlate}`
          );
        }
      } else {
        console.log(`   ⚠️  No shipper profile, creating...`);
        const newProfile = new ShipperProfile({
          userId: shipper._id,
          vehicleType: "motorbike",
          vehiclePlate: "59-X1 88888",
          phoneNumber: "0909888888",
          isActive: true,
          totalDeliveries: 0,
          rating: 5.0,
        });
        await newProfile.save();
        shipper.shipperProfileId = newProfile._id;
        await shipper.save();
        console.log(`   ✅ Created shipper profile: ${newProfile._id}`);
      }

      // Verify check-ins
      const shipperCheckins = await DeliveryCheckin.countDocuments({
        shipperId: shipper._id,
      });
      console.log(`   Check-ins (as shipper): ${shipperCheckins}`);
    } else {
      console.log(`   ❌ Shipper not found!`);
    }

    // ========================================
    // 3. Summary
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ CONVERSION COMPLETE");
    console.log("=".repeat(60));

    console.log(`\n📋 FINAL STATUS:`);

    const finalCustomer = await User.findOne({ email: customerEmail }).lean();
    const finalShipper = await User.findOne({ email: shipperEmail }).lean();

    if (finalCustomer) {
      const orders = await MasterOrder.countDocuments({
        customerId: finalCustomer._id,
      });
      const checkins = await DeliveryCheckin.countDocuments({
        customerId: finalCustomer._id,
      });
      console.log(`\n   👤 Customer: ${customerEmail}`);
      console.log(`      Auth: ${finalCustomer.authMethod}`);
      console.log(`      Orders: ${orders}`);
      console.log(`      Check-ins: ${checkins}`);
    }

    if (finalShipper) {
      const checkins = await DeliveryCheckin.countDocuments({
        shipperId: finalShipper._id,
      });
      console.log(`\n   🚚 Shipper: ${shipperEmail}`);
      console.log(`      Auth: ${finalShipper.authMethod}`);
      console.log(
        `      Shipper Profile: ${finalShipper.shipperProfileId || "None"}`
      );
      console.log(`      Check-ins: ${checkins}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 NOW TRY LOGGING IN WITH GOOGLE!");
    console.log("=".repeat(60));
    console.log(`\n   1. Customer: ${customerEmail}`);
    console.log(`      → Login with Google → See orders in "Đơn hàng"`);
    console.log(`      → See delivery map in "Bản đồ giao hàng"`);
    console.log(`\n   2. Shipper: ${shipperEmail}`);
    console.log(`      → Login with Google at /shipper`);
    console.log(`      → See check-in history`);
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

convertToGoogleAuth();
