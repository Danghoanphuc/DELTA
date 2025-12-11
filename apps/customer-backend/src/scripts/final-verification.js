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

  console.log("\n" + "=".repeat(60));
  console.log("🔍 FINAL VERIFICATION");
  console.log("=".repeat(60));

  // 1. Check user
  const user = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n✅ USER:");
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user._id}`);
  console.log(`   organizationProfileId: ${user.organizationProfileId}`);
  console.log(
    `   googleId: ${user.googleId || "null (will be set on Google login)"}`
  );

  // 2. Check organization
  if (user.organizationProfileId) {
    const org = await OrganizationProfile.findById(user.organizationProfileId);
    console.log("\n✅ ORGANIZATION:");
    console.log(`   Name: ${org.businessName}`);
    console.log(`   ID: ${org._id}`);
    console.log(
      `   User linked: ${
        org.user.toString() === user._id.toString() ? "YES" : "NO"
      }`
    );
  }

  // 3. Check orders
  const orders = await SwagOrder.find({
    organization: user.organizationProfileId,
  });
  console.log("\n✅ SWAG ORDERS:");
  console.log(`   Count: ${orders.length}`);
  orders.forEach((o) => {
    const icon =
      o.status === "delivered"
        ? "✅"
        : o.status === "shipped"
        ? "🚚"
        : o.status === "processing"
        ? "⏳"
        : o.status === "paid"
        ? "💰"
        : "📝";
    console.log(`   ${icon} ${o.orderNumber} | ${o.status} | ${o.name}`);
  });

  // 4. Instructions
  console.log("\n" + "=".repeat(60));
  console.log("📝 INSTRUCTIONS");
  console.log("=".repeat(60));
  console.log("\n1. Logout from current account (if logged in)");
  console.log("2. Clear browser localStorage (optional but recommended)");
  console.log("3. Login with Google using email: phucdh911@gmail.com");
  console.log(
    "4. Go to: http://localhost:5173/organization/dashboard?tab=swag-orders"
  );
  console.log("5. You should see 5 orders!");

  console.log("\n⚠️  If still not working:");
  console.log("   - Check browser console for errors");
  console.log("   - Check network tab for API responses");
  console.log("   - Make sure backend is running on port 3000");

  await mongoose.disconnect();
}

verify();
