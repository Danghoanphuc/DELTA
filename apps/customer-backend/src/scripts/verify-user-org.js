import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function verify() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");
  const { OrganizationProfile } = await import(
    "../modules/organizations/organization.model.js"
  );
  const { SwagOrder } = await import(
    "../modules/swag-orders/swag-order.model.js"
  );

  const user = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n=== USER ===");
  console.log("Email:", user.email);
  console.log("organizationProfileId:", user.organizationProfileId);

  if (user.organizationProfileId) {
    const org = await OrganizationProfile.findById(user.organizationProfileId);
    console.log("\n=== ORGANIZATION ===");
    console.log("Name:", org?.businessName);
    console.log("ID:", org?._id);

    const orders = await SwagOrder.find({
      organization: user.organizationProfileId,
    });
    console.log("\n=== SWAG ORDERS ===");
    console.log("Count:", orders.length);
    orders.forEach((o) =>
      console.log(`  - ${o.orderNumber} | ${o.status} | ${o.name}`)
    );
  }

  await mongoose.disconnect();
}

verify();
