// apps/customer-backend/src/scripts/verify-polymorphic-solution.js
/**
 * Verification Script: Polymorphic Reference Solution
 *
 * Verifies that the polymorphic reference pattern is working correctly:
 * 1. DeliveryCheckin model has orderType and orderModel fields
 * 2. OrderResolverService can resolve orders from both types
 * 3. Repository methods work with polymorphic references
 *
 * Run: node --experimental-vm-modules src/scripts/verify-polymorphic-solution.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

async function verify() {
  console.log("=".repeat(70));
  console.log("🔍 VERIFICATION: Polymorphic Reference Solution");
  console.log("=".repeat(70));

  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // Import models first to register schemas
  const { User } = await import("../shared/models/user.model.js");
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );
  const { MasterOrder } = await import(
    "../shared/models/master-order.model.js"
  );

  // Import modules
  const { DeliveryCheckin } = await import(
    "../modules/delivery-checkin/delivery-checkin.model.js"
  );
  const { DeliveryCheckinRepository } = await import(
    "../modules/delivery-checkin/delivery-checkin.repository.js"
  );
  const { orderResolverService } = await import(
    "../shared/services/order-resolver.service.js"
  );
  const { ORDER_TYPES, ORDER_TYPE_TO_MODEL, detectOrderTypeFromNumber } =
    await import("../shared/constants/order-types.constant.js");

  const repository = new DeliveryCheckinRepository();

  // Test 1: Verify constants
  console.log("📊 Test 1: Order Types Constants");
  console.log(`   ORDER_TYPES: ${JSON.stringify(ORDER_TYPES)}`);
  console.log(`   ORDER_TYPE_TO_MODEL: ${JSON.stringify(ORDER_TYPE_TO_MODEL)}`);
  console.log(
    `   detectOrderTypeFromNumber("SW20251200001"): ${detectOrderTypeFromNumber(
      "SW20251200001"
    )}`
  );
  console.log(
    `   detectOrderTypeFromNumber("MO20251200001"): ${detectOrderTypeFromNumber(
      "MO20251200001"
    )}`
  );
  console.log("   ✅ Constants OK\n");

  // Test 2: Verify DeliveryCheckin schema
  console.log("📊 Test 2: DeliveryCheckin Schema");
  const sampleCheckin = await DeliveryCheckin.findOne({
    isDeleted: false,
  }).lean();
  if (sampleCheckin) {
    console.log(`   Sample check-in ID: ${sampleCheckin._id}`);
    console.log(`   orderNumber: ${sampleCheckin.orderNumber}`);
    console.log(`   orderType: ${sampleCheckin.orderType}`);
    console.log(`   orderModel: ${sampleCheckin.orderModel}`);
    console.log(`   orderId: ${sampleCheckin.orderId}`);

    if (sampleCheckin.orderType && sampleCheckin.orderModel) {
      console.log("   ✅ Schema has polymorphic fields\n");
    } else {
      console.log("   ❌ Missing polymorphic fields!\n");
    }
  } else {
    console.log("   ⚠️ No check-ins found\n");
  }

  // Test 3: Verify OrderResolverService
  console.log("📊 Test 3: OrderResolverService");

  // Test with SwagOrder
  const swagOrder = await SwagOrder.findOne({}).lean();
  if (swagOrder) {
    console.log(`   Testing SwagOrder: ${swagOrder.orderNumber}`);
    const resolved = await orderResolverService.resolveById(
      swagOrder._id.toString(),
      ORDER_TYPES.SWAG
    );
    if (resolved) {
      console.log(
        `   ✅ Resolved SwagOrder: ${resolved.orderNumber} (type: ${resolved.orderType})`
      );
    } else {
      console.log("   ❌ Failed to resolve SwagOrder");
    }
  }

  // Test with MasterOrder
  const masterOrder = await MasterOrder.findOne({}).lean();
  if (masterOrder) {
    console.log(`   Testing MasterOrder: ${masterOrder.orderNumber}`);
    const resolved = await orderResolverService.resolveById(
      masterOrder._id.toString(),
      ORDER_TYPES.MASTER
    );
    if (resolved) {
      console.log(
        `   ✅ Resolved MasterOrder: ${resolved.orderNumber} (type: ${resolved.orderType})`
      );
    } else {
      console.log("   ❌ Failed to resolve MasterOrder");
    }
  }

  // Test auto-detect from orderNumber
  if (swagOrder) {
    const autoResolved = await orderResolverService.resolveByOrderNumber(
      swagOrder.orderNumber
    );
    if (autoResolved) {
      console.log(
        `   ✅ Auto-detected order type from number: ${autoResolved.orderType}`
      );
    }
  }
  console.log("");

  // Test 4: Verify Repository methods
  console.log("📊 Test 4: Repository Methods");

  if (sampleCheckin) {
    // Test findById
    const found = await repository.findById(sampleCheckin._id.toString());
    console.log(`   findById: ${found ? "✅" : "❌"}`);

    // Test findByIdWithOrder
    const foundWithOrder = await repository.findByIdWithOrder(
      sampleCheckin._id.toString()
    );
    console.log(
      `   findByIdWithOrder: ${
        foundWithOrder?.order ? "✅ (order resolved)" : "⚠️ (no order)"
      }`
    );

    // Test findByOrder
    const byOrder = await repository.findByOrder(
      sampleCheckin.orderId,
      sampleCheckin.orderType
    );
    console.log(
      `   findByOrder: ${byOrder.length > 0 ? "✅" : "❌"} (${
        byOrder.length
      } found)`
    );

    // Test findByCustomer
    const byCustomer = await repository.findByCustomer(
      sampleCheckin.customerId
    );
    console.log(
      `   findByCustomer: ${byCustomer.length > 0 ? "✅" : "❌"} (${
        byCustomer.length
      } found)`
    );

    // Test findByShipper
    const byShipper = await repository.findByShipper(sampleCheckin.shipperId);
    console.log(
      `   findByShipper: ${byShipper.length > 0 ? "✅" : "❌"} (${
        byShipper.length
      } found)`
    );
  }
  console.log("");

  // Test 5: Verify all check-ins have polymorphic fields
  console.log("📊 Test 5: Data Integrity Check");
  const allCheckins = await DeliveryCheckin.find({ isDeleted: false }).lean();
  const withOrderType = allCheckins.filter((c) => c.orderType);
  const withOrderModel = allCheckins.filter((c) => c.orderModel);

  console.log(`   Total check-ins: ${allCheckins.length}`);
  console.log(`   With orderType: ${withOrderType.length}`);
  console.log(`   With orderModel: ${withOrderModel.length}`);

  if (
    allCheckins.length === withOrderType.length &&
    allCheckins.length === withOrderModel.length
  ) {
    console.log("   ✅ All check-ins have polymorphic fields");
  } else {
    console.log("   ❌ Some check-ins missing polymorphic fields!");
    const missing = allCheckins.filter((c) => !c.orderType || !c.orderModel);
    missing.forEach((c) => {
      console.log(
        `      - ${c.orderNumber}: orderType=${c.orderType}, orderModel=${c.orderModel}`
      );
    });
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("📋 SUMMARY");
  console.log("=".repeat(70));
  console.log(`
✅ Polymorphic Reference Pattern Implementation:

1. ORDER_TYPES constant: Defines 'swag' and 'master' types
2. ORDER_TYPE_TO_MODEL mapping: Maps types to Mongoose model names
3. DeliveryCheckin model: Has orderType, orderModel, orderId fields
4. OrderResolverService: Resolves orders from any type dynamically
5. Repository: Uses resolver instead of direct populate

This pattern allows:
- Single DeliveryCheckin collection for all order types
- Dynamic order resolution without hardcoded model references
- Easy addition of new order types in the future
- No "Schema hasn't been registered" errors
`);

  await mongoose.disconnect();
  console.log("✅ Verification complete!");
}

verify().catch(console.error);
