// scripts/fix-single-user.js
// ✅ Quick fix: Xóa printerProfileId cho một user cụ thể

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;

// ✅ THAY ĐỔI EMAIL Ở ĐÂY
const USER_EMAIL = process.argv[2]; // Lấy từ command line argument

if (!USER_EMAIL) {
  console.error("❌ Vui lòng cung cấp email của user");
  console.log("\nCách dùng:");
  console.log("  node scripts/fix-single-user.js your-email@example.com\n");
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
    // Connect
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB\n");

    // Find user
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email: USER_EMAIL });

    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${USER_EMAIL}`);
      process.exit(1);
    }

    console.log("📊 User hiện tại:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(
      `   organizationProfileId: ${user.organizationProfileId || "null"}`
    );
    console.log(`   printerProfileId: ${user.printerProfileId || "null"}`);
    console.log(`   customerProfileId: ${user.customerProfileId || "null"}\n`);

    // Check if needs fixing
    if (!user.organizationProfileId) {
      console.log("ℹ️  User không có organizationProfileId, không cần fix");
      process.exit(0);
    }

    if (!user.printerProfileId) {
      console.log("✅ User không có printerProfileId, đã clean rồi!");
      process.exit(0);
    }

    // Fix user
    console.log("🔧 Đang xóa printerProfileId...\n");

    const result = await mongoose.connection.db.collection("users").updateOne(
      { email: USER_EMAIL },
      {
        $unset: { printerProfileId: "" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Đã xóa printerProfileId thành công!\n");

      // Verify
      const updatedUser = await mongoose.connection.db
        .collection("users")
        .findOne({ email: USER_EMAIL });

      console.log("📊 User sau khi fix:");
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
      console.log("   1. Clear localStorage trong browser");
      console.log("   2. Đăng nhập lại");
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

fixUser();
