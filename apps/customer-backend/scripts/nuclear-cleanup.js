// scripts/nuclear-cleanup.js
// ☢️ NUCLEAR OPTION: Xóa TẤT CẢ printerProfileId và clear cache

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODB_CONNECTIONSTRING;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI không được định nghĩa trong .env");
  process.exit(1);
}

async function nuclearCleanup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB\n");

    console.log("☢️  NUCLEAR CLEANUP - Xóa TẤT CẢ printerProfileId\n");

    // 1. Count users có printerProfileId
    const count = await mongoose.connection.db
      .collection("users")
      .countDocuments({
        printerProfileId: { $exists: true, $ne: null },
      });

    console.log(`📊 Tìm thấy ${count} user(s) có printerProfileId\n`);

    if (count === 0) {
      console.log("✅ Database đã clean! Không cần làm gì.\n");
      return;
    }

    // 2. Xóa TẤT CẢ printerProfileId
    console.log("🔥 Đang xóa TẤT CẢ printerProfileId...\n");

    const result = await mongoose.connection.db.collection("users").updateMany(
      {
        printerProfileId: { $exists: true, $ne: null },
      },
      {
        $unset: { printerProfileId: "" },
      }
    );

    console.log(
      `✅ Đã xóa printerProfileId từ ${result.modifiedCount} user(s)\n`
    );

    // 3. Verify
    const remaining = await mongoose.connection.db
      .collection("users")
      .countDocuments({
        printerProfileId: { $exists: true, $ne: null },
      });

    if (remaining === 0) {
      console.log(
        "✅ VERIFICATION PASSED: Không còn user nào có printerProfileId\n"
      );
    } else {
      console.log(
        `⚠️  WARNING: Vẫn còn ${remaining} user(s) có printerProfileId\n`
      );
    }

    // 4. Show users with organizationProfileId
    const orgUsers = await mongoose.connection.db
      .collection("users")
      .find({
        organizationProfileId: { $exists: true, $ne: null },
      })
      .project({ email: 1, organizationProfileId: 1 })
      .toArray();

    console.log(`📊 ${orgUsers.length} user(s) có organizationProfileId:`);
    orgUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.organizationProfileId})`);
    });
    console.log("");

    console.log("🎉 NUCLEAR CLEANUP HOÀN TẤT!\n");
    console.log("📝 Tiếp theo:");
    console.log("   1. Restart backend server (Ctrl+C và npm run dev)");
    console.log("   2. Clear browser: localStorage.clear() + reload");
    console.log("   3. Đăng nhập lại\n");
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối MongoDB");
  }
}

nuclearCleanup();
