// scripts/fix-user-by-id.js
// ✅ Fix user bằng user ID

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
  console.log("  node scripts/fix-user-by-id.js 6919b34c10497b9e958753db\n");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI hoặc MONGODB_CONNECTIONSTRING không được định nghĩa trong .env"
  );
  process.exit(1);
}

async function fixUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB\n");

    // Find user by ID
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
      `   organizationProfileId: ${user.organizationProfileId || "null"}`
    );
    console.log(`   printerProfileId: ${user.printerProfileId || "null"}`);
    console.log(`   customerProfileId: ${user.customerProfileId || "null"}\n`);

    if (!user.organizationProfileId) {
      console.log("ℹ️  User không có organizationProfileId, không cần fix");
      process.exit(0);
    }

    if (!user.printerProfileId) {
      console.log("✅ User không có printerProfileId, đã clean rồi!");
      process.exit(0);
    }

    console.log("🔧 Đang xóa printerProfileId...\n");

    const result = await mongoose.connection.db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(USER_ID) },
      {
        $unset: { printerProfileId: "" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Đã xóa printerProfileId thành công!\n");

      const updatedUser = await mongoose.connection.db
        .collection("users")
        .findOne({ _id: new mongoose.Types.ObjectId(USER_ID) });

      console.log("📊 User sau khi fix:");
      console.log(`   ID: ${updatedUser._id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(
        `   organizationProfileId: ${
          updatedUser.organizationProfileId || "null"
        }`
      );
      console.log(
        `   printerProfileId: ${updatedUser.printerProfileId || "null"}`
      );
      console.log(
        `   customerProfileId: ${updatedUser.customerProfileId || "null"}\n`
      );

      console.log("🎉 Fix hoàn tất! Hãy:");
      console.log("   1. Restart backend server (để clear cache)");
      console.log("   2. Clear localStorage trong browser");
      console.log("   3. Đăng nhập lại\n");
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

fixUser();
