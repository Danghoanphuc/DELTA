// apps/customer-backend/src/scripts/migrations/migrate-delivery-checkins-polymorphic.js
/**
 * Migration Script: Update DeliveryCheckin to Polymorphic Reference
 *
 * This migration:
 * 1. Adds orderType field based on orderNumber prefix
 * 2. Adds orderModel field for refPath
 * 3. Validates all existing records
 *
 * Run: node --experimental-vm-modules src/scripts/migrations/migrate-delivery-checkins-polymorphic.js
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

const ORDER_NUMBER_PREFIXES = {
  [ORDER_TYPES.SWAG]: "SW",
  [ORDER_TYPES.MASTER]: "MO",
};

function detectOrderTypeFromNumber(orderNumber) {
  if (!orderNumber || typeof orderNumber !== "string") {
    return null;
  }

  const prefix = orderNumber.substring(0, 2).toUpperCase();

  for (const [type, typePrefix] of Object.entries(ORDER_NUMBER_PREFIXES)) {
    if (prefix === typePrefix) {
      return type;
    }
  }

  return null;
}

async function migrate() {
  console.log("=".repeat(70));
  console.log("🔄 MIGRATION: DeliveryCheckin Polymorphic Reference");
  console.log("=".repeat(70));

  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;
  const collection = db.collection("deliverycheckins");

  // Step 1: Get all check-ins
  console.log("📊 Step 1: Analyzing existing data...");
  const allCheckins = await collection.find({}).toArray();
  console.log(`   Total check-ins: ${allCheckins.length}`);

  if (allCheckins.length === 0) {
    console.log("   No check-ins to migrate.");
    await mongoose.disconnect();
    return;
  }

  // Step 2: Categorize by orderNumber prefix
  console.log("\n📊 Step 2: Categorizing by order type...");
  const stats = {
    swag: 0,
    master: 0,
    unknown: 0,
    alreadyMigrated: 0,
  };

  const toMigrate = [];

  for (const checkin of allCheckins) {
    // Skip if already migrated
    if (checkin.orderType && checkin.orderModel) {
      stats.alreadyMigrated++;
      continue;
    }

    const orderType = detectOrderTypeFromNumber(checkin.orderNumber);

    if (orderType) {
      stats[orderType]++;
      toMigrate.push({
        _id: checkin._id,
        orderNumber: checkin.orderNumber,
        orderType,
        orderModel: ORDER_TYPE_TO_MODEL[orderType],
      });
    } else {
      stats.unknown++;
      console.log(`   ⚠️ Unknown order type for: ${checkin.orderNumber}`);
    }
  }

  console.log(`   SwagOrder check-ins: ${stats.swag}`);
  console.log(`   MasterOrder check-ins: ${stats.master}`);
  console.log(`   Unknown: ${stats.unknown}`);
  console.log(`   Already migrated: ${stats.alreadyMigrated}`);

  if (toMigrate.length === 0) {
    console.log("\n✅ No check-ins need migration.");
    await mongoose.disconnect();
    return;
  }

  // Step 3: Perform migration
  console.log(`\n📊 Step 3: Migrating ${toMigrate.length} check-ins...`);

  let migrated = 0;
  let failed = 0;

  for (const item of toMigrate) {
    try {
      await collection.updateOne(
        { _id: item._id },
        {
          $set: {
            orderType: item.orderType,
            orderModel: item.orderModel,
          },
        }
      );
      migrated++;

      if (migrated % 100 === 0) {
        console.log(`   Migrated ${migrated}/${toMigrate.length}...`);
      }
    } catch (error) {
      failed++;
      console.log(
        `   ❌ Failed to migrate ${item.orderNumber}: ${error.message}`
      );
    }
  }

  console.log(`\n   ✅ Migrated: ${migrated}`);
  console.log(`   ❌ Failed: ${failed}`);

  // Step 4: Verify migration
  console.log("\n📊 Step 4: Verifying migration...");

  const withOrderType = await collection.countDocuments({
    orderType: { $exists: true },
  });
  const withOrderModel = await collection.countDocuments({
    orderModel: { $exists: true },
  });
  const total = await collection.countDocuments({});

  console.log(`   Total check-ins: ${total}`);
  console.log(`   With orderType: ${withOrderType}`);
  console.log(`   With orderModel: ${withOrderModel}`);

  if (withOrderType === total && withOrderModel === total) {
    console.log("\n✅ Migration completed successfully!");
  } else {
    console.log(
      "\n⚠️ Migration incomplete. Some records may need manual review."
    );
  }

  // Step 5: Create indexes
  console.log("\n📊 Step 5: Creating indexes...");
  try {
    await collection.createIndex({ orderType: 1, orderId: 1, checkinAt: -1 });
    await collection.createIndex({ orderNumber: 1, orderType: 1 });
    console.log("   ✅ Indexes created");
  } catch (error) {
    console.log(`   ⚠️ Index creation warning: ${error.message}`);
  }

  await mongoose.disconnect();
  console.log("\n" + "=".repeat(70));
  console.log("✅ Migration complete!");
  console.log("=".repeat(70));
}

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
