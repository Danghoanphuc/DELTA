// apps/customer-backend/src/scripts/check-user-profiles.js
/**
 * Check user profiles to understand the data structure
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function checkUserProfiles() {
  console.log("🔍 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const { User } = await import("../shared/models/user.model.js");

  console.log("=".repeat(70));
  console.log("👤 USER PROFILES CHECK");
  console.log("=".repeat(70));

  // Check customer
  const customer = await User.findOne({ email: "phucdh911@gmail.com" });
  if (customer) {
    console.log("\n📧 Customer: phucdh911@gmail.com");
    console.log(`   _id: ${customer._id}`);
    console.log(`   displayName: ${customer.displayName}`);
    console.log(`   organizationProfileId: ${customer.organizationProfileId}`);
    console.log(`   customerProfileId: ${customer.customerProfileId}`);
    console.log(`   shipperProfileId: ${customer.shipperProfileId}`);
    console.log(`   printerProfileId: ${customer.printerProfileId}`);
    console.log(`   isAdmin: ${customer.isAdmin}`);
  }

  // Check shipper
  const shipper = await User.findOne({ email: "danghoanphuc16@gmail.com" });
  if (shipper) {
    console.log("\n📧 Shipper: danghoanphuc16@gmail.com");
    console.log(`   _id: ${shipper._id}`);
    console.log(`   displayName: ${shipper.displayName}`);
    console.log(`   organizationProfileId: ${shipper.organizationProfileId}`);
    console.log(`   customerProfileId: ${shipper.customerProfileId}`);
    console.log(`   shipperProfileId: ${shipper.shipperProfileId}`);
    console.log(`   printerProfileId: ${shipper.printerProfileId}`);
    console.log(`   isAdmin: ${shipper.isAdmin}`);
  }

  await mongoose.disconnect();
  console.log("\n✅ Check complete");
}

checkUserProfiles().catch(console.error);
