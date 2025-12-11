import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function testAPI() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");
  const { SwagOrderService } = await import(
    "../modules/swag-orders/swag-order.service.js"
  );

  const user = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n=== USER ===");
  console.log("Email:", user.email);
  console.log("organizationProfileId:", user.organizationProfileId);

  if (!user.organizationProfileId) {
    console.log("\n❌ User does not have organizationProfileId!");
    await mongoose.disconnect();
    return;
  }

  console.log("\n=== TESTING SWAG ORDER SERVICE ===");
  const service = new SwagOrderService();

  try {
    const result = await service.getOrders(user.organizationProfileId, {
      status: "all",
      page: 1,
      limit: 20,
    });

    console.log("\n✅ API Response:");
    console.log("Orders count:", result.orders?.length || 0);
    if (result.orders?.length > 0) {
      result.orders.forEach((o) => {
        console.log(`  - ${o.orderNumber} | ${o.status} | ${o.name}`);
      });
    }
  } catch (error) {
    console.log("\n❌ API Error:", error.message);
  }

  await mongoose.disconnect();
}

testAPI();
