// scripts/cleanup-printer-profile-ids.js
// ✅ Migration script: Xóa printerProfileId khỏi users có organizationProfileId
// Mục đích: Fix conflict khi user có cả 2 profile IDs

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

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI hoặc MONGODB_CONNECTIONSTRING không được định nghĩa trong .env"
  );
  process.exit(1);
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
}

// Main cleanup function
async function cleanupPrinterProfileIds() {
  try {
    console.log(
      "\n🔍 Đang tìm users có cả organizationProfileId và printerProfileId...\n"
    );

    // Find users with both profile IDs
    const usersWithBothProfiles = await mongoose.connection.db
      .collection("users")
      .find({
        organizationProfileId: { $exists: true, $ne: null },
        printerProfileId: { $exists: true, $ne: null },
      })
      .toArray();

    if (usersWithBothProfiles.length === 0) {
      console.log(
        "✅ Không tìm thấy user nào có cả 2 profile IDs. Database đã clean!"
      );
      return;
    }

    console.log(
      `📊 Tìm thấy ${usersWithBothProfiles.length} user(s) cần cleanup:\n`
    );

    // Display users before cleanup
    usersWithBothProfiles.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   - organizationProfileId: ${user.organizationProfileId}`);
      console.log(`   - printerProfileId: ${user.printerProfileId}`);
      console.log("");
    });

    // Confirm cleanup
    console.log(
      "⚠️  Sẽ XÓA printerProfileId khỏi các users trên (giữ lại organizationProfileId)\n"
    );

    // Perform cleanup
    const result = await mongoose.connection.db.collection("users").updateMany(
      {
        organizationProfileId: { $exists: true, $ne: null },
        printerProfileId: { $exists: true, $ne: null },
      },
      {
        $unset: { printerProfileId: "" },
      }
    );

    console.log(`✅ Cleanup hoàn tất!`);
    console.log(`   - Số users đã update: ${result.modifiedCount}`);
    console.log(`   - Matched count: ${result.matchedCount}\n`);

    // Verify cleanup
    const remainingUsers = await mongoose.connection.db
      .collection("users")
      .find({
        organizationProfileId: { $exists: true, $ne: null },
        printerProfileId: { $exists: true, $ne: null },
      })
      .toArray();

    if (remainingUsers.length === 0) {
      console.log(
        "✅ Verification passed: Không còn user nào có cả 2 profile IDs\n"
      );
    } else {
      console.log(
        `⚠️  Warning: Vẫn còn ${remainingUsers.length} user(s) có cả 2 profile IDs\n`
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi cleanup:", error);
    throw error;
  }
}

// Run script
async function main() {
  try {
    await connectDB();
    await cleanupPrinterProfileIds();
    console.log("🎉 Script hoàn tất!\n");
  } catch (error) {
    console.error("❌ Script thất bại:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối MongoDB");
    process.exit(0);
  }
}

main();
