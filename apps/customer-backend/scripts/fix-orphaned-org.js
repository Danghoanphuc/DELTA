// scripts/fix-orphaned-org.js
// ✅ Fix orphaned organization profile - link lại với user

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;
const USER_ID = process.argv[2];

if (!USER_ID) {
  console.error("❌ Vui lòng cung cấp user ID");
  console.log("\nCách dùng:");
  console.log("  node scripts/fix-orphaned-org.js 6919b39a10497b9e958753f2\n");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI không được định nghĩa trong .env");
  process.exit(1);
}

async function fixOrphanedOrg() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB\n");

    // 1. Find user
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(USER_ID) });

    if (!user) {
      console.error(`❌ Không tìm thấy user với ID: ${USER_ID}`);
      process.exit(1);
    }

    console.log("📊 User hiện tại:");
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(
      `   organizationProfileId: ${user.organizationProfileId || "❌ NULL"}\n`
    );

    // 2. Find orphaned organization profile
    const orgProfile = await mongoose.connection.db
      .collection("organizationprofiles")
      .findOne({ user: new mongoose.Types.ObjectId(USER_ID) });

    if (!orgProfile) {
      console.log("❌ Không tìm thấy organization profile cho user này");
      console.log("   User chưa đăng ký organization.\n");
      process.exit(0);
    }

    console.log("🔍 Tìm thấy orphaned organization profile:");
    console.log(`   Profile ID: ${orgProfile._id}`);
    console.log(`   Business Name: ${orgProfile.businessName}`);
    console.log(`   Created At: ${orgProfile.createdAt}\n`);

    // 3. Check if already linked
    if (
      user.organizationProfileId &&
      user.organizationProfileId.toString() === orgProfile._id.toString()
    ) {
      console.log("✅ User đã được link với organization profile!");
      console.log("   Không cần fix gì cả.\n");
      process.exit(0);
    }

    // 4. Link user with organization profile
    console.log("🔧 Đang link user với organization profile...\n");

    const result = await mongoose.connection.db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(USER_ID) },
      {
        $set: { organizationProfileId: orgProfile._id },
        $unset: { printerProfileId: "", customerProfileId: "" }, // Clean up other profiles
      }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Đã link thành công!\n");

      // Verify
      const updatedUser = await mongoose.connection.db
        .collection("users")
        .findOne({ _id: new mongoose.Types.ObjectId(USER_ID) });

      console.log("📊 User sau khi fix:");
      console.log(`   ID: ${updatedUser._id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(
        `   organizationProfileId: ${updatedUser.organizationProfileId} ✅\n`
      );

      console.log("🎉 FIX HOÀN TẤT!\n");
      console.log("📝 Tiếp theo:");
      console.log("   1. Clear browser localStorage");
      console.log("   2. Reload page (F5)");
      console.log("   3. Sẽ redirect đúng về /organization/dashboard\n");
    } else {
      console.log("⚠️  Không có thay đổi nào được thực hiện");
    }
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối MongoDB");
  }
}

fixOrphanedOrg();
