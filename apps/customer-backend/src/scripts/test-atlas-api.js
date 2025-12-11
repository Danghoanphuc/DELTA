import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function test() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );

  const user = await User.findOne({ email: "phucdh911@gmail.com" });

  console.log("\n=== USER IN ATLAS ===");
  console.log("Email:", user.email);
  console.log("ID:", user._id);
  console.log("organizationProfileId:", user.organizationProfileId);

  // Check orders
  const orders = await SwagOrder.find({
    organization: user.organizationProfileId,
  });
  console.log("\n=== ORDERS IN ATLAS ===");
  console.log("Count:", orders.length);
  orders.forEach((o) => console.log(`  - ${o.orderNumber} | ${o.status}`));

  // Generate token
  const token = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  console.log("\n=== TEST API ===");
  console.log(
    `curl -H "Authorization: Bearer ${token}" http://localhost:5001/api/users/me`
  );
  console.log(
    `\ncurl -H "Authorization: Bearer ${token}" http://localhost:5001/api/swag-orders`
  );

  await mongoose.disconnect();
}

test();
