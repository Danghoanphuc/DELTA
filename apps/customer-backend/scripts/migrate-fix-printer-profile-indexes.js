// apps/customer-backend/scripts/migrate-fix-printer-profile-indexes.js
// ✅ FIX: Migration script để xóa index cũ và cleanup data

import mongoose from "mongoose";
import { config } from "../src/config/env.config.js";
import { PrinterProfile } from "../src/shared/models/printer-profile.model.js";
import { Logger } from "../src/shared/utils/index.js";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function migratePrinterProfileIndexes() {
  try {
    log("🔌 Đang kết nối MongoDB...", colors.blue);
    await mongoose.connect(config.db.connectionString);
    log("✅ Đã kết nối MongoDB thành công!", colors.green);

    const db = mongoose.connection.db;
    const collection = db.collection("printerprofiles");

    // ✅ BƯỚC 1: Kiểm tra các indexes hiện tại
    log("\n📊 Đang kiểm tra indexes hiện tại...", colors.blue);
    const indexes = await collection.indexes();
    log(`✅ Tìm thấy ${indexes.length} indexes:`, colors.green);
    indexes.forEach((index) => {
      log(`   - ${index.name}: ${JSON.stringify(index.key)}`, colors.yellow);
    });

    // ✅ BƯỚC 2: Xóa index cũ `userId_1` nếu có
    const userIdIndex = indexes.find(
      (idx) => idx.name === "userId_1" || (idx.key && idx.key.userId)
    );
    if (userIdIndex) {
      log(`\n🗑️  Đang xóa index cũ: ${userIdIndex.name}...`, colors.yellow);
      try {
        await collection.dropIndex(userIdIndex.name);
        log(`✅ Đã xóa index: ${userIdIndex.name}`, colors.green);
      } catch (error) {
        if (error.code === 27) {
          log(`⚠️  Index ${userIdIndex.name} không tồn tại, bỏ qua...`, colors.yellow);
        } else {
          throw error;
        }
      }
    } else {
      log("\n✅ Không tìm thấy index userId_1, không cần xóa", colors.green);
    }

    // ✅ BƯỚC 3: Kiểm tra và cleanup documents có userId: null
    log("\n🧹 Đang kiểm tra documents có userId: null...", colors.blue);
    const orphanedDocs = await collection.find({ userId: null }).toArray();
    log(`✅ Tìm thấy ${orphanedDocs.length} documents có userId: null`, colors.yellow);

    if (orphanedDocs.length > 0) {
      log("\n📝 Chi tiết documents:", colors.blue);
      orphanedDocs.forEach((doc) => {
        log(`   - _id: ${doc._id}, user: ${doc.user || "null"}, businessName: ${doc.businessName || "null"}`, colors.yellow);
      });

      // ✅ BƯỚC 4: Xóa các documents orphaned (không có user)
      log("\n🗑️  Đang xóa các documents orphaned...", colors.yellow);
      const deleteResult = await collection.deleteMany({ userId: null, user: { $exists: false } });
      log(`✅ Đã xóa ${deleteResult.deletedCount} documents orphaned`, colors.green);

      // ✅ BƯỚC 5: Nếu có documents có userId: null nhưng có user, update userId từ user
      const docsWithUser = await collection.find({ userId: null, user: { $exists: true, $ne: null } }).toArray();
      if (docsWithUser.length > 0) {
        log(`\n🔄 Đang cập nhật ${docsWithUser.length} documents có user nhưng thiếu userId...`, colors.blue);
        for (const doc of docsWithUser) {
          if (doc.user) {
            await collection.updateOne(
              { _id: doc._id },
              { $set: { userId: doc.user } }
            );
            log(`   ✅ Đã cập nhật document ${doc._id}`, colors.green);
          }
        }
      }
    } else {
      log("\n✅ Không có documents orphaned, không cần cleanup", colors.green);
    }

    // ✅ BƯỚC 6: Xóa duplicate indexes nếu có
    log("\n🧹 Đang kiểm tra và xóa duplicate indexes...", colors.blue);
    const indexesToCheck = [
      { name: "businessName_1", reason: "Đã có text index bao gồm businessName" },
    ];
    
    for (const idxInfo of indexesToCheck) {
      const existingIdx = indexes.find((idx) => idx.name === idxInfo.name);
      if (existingIdx) {
        log(`🗑️  Đang xóa index duplicate: ${idxInfo.name} (${idxInfo.reason})...`, colors.yellow);
        try {
          await collection.dropIndex(idxInfo.name);
          log(`✅ Đã xóa index: ${idxInfo.name}`, colors.green);
        } catch (error) {
          if (error.code === 27) {
            log(`⚠️  Index ${idxInfo.name} không tồn tại, bỏ qua...`, colors.yellow);
          } else {
            log(`⚠️  Lỗi khi xóa index ${idxInfo.name}: ${error.message}`, colors.yellow);
          }
        }
      }
    }

    // ✅ BƯỚC 7: Kiểm tra lại indexes sau khi xóa
    log("\n📊 Đang kiểm tra indexes sau khi cleanup...", colors.blue);
    const finalIndexes = await collection.indexes();
    log(`✅ Còn lại ${finalIndexes.length} indexes:`, colors.green);
    finalIndexes.forEach((index) => {
      log(`   - ${index.name}: ${JSON.stringify(index.key)}`, colors.yellow);
    });

    // ✅ BƯỚC 8: Đảm bảo index `user_1` tồn tại (unique)
    const userIndex = finalIndexes.find(
      (idx) => idx.name === "user_1" || (idx.key && idx.key.user)
    );
    if (!userIndex) {
      log("\n🔧 Đang tạo index mới: user_1 (unique)...", colors.blue);
      await collection.createIndex({ user: 1 }, { unique: true, name: "user_1" });
      log("✅ Đã tạo index: user_1", colors.green);
    } else {
      log("\n✅ Index user_1 đã tồn tại", colors.green);
      // Đảm bảo index là unique
      if (!userIndex.unique) {
        log("⚠️  Index user_1 không phải unique, cần recreate...", colors.yellow);
        try {
          await collection.dropIndex("user_1");
          await collection.createIndex({ user: 1 }, { unique: true, name: "user_1" });
          log("✅ Đã recreate index user_1 với unique constraint", colors.green);
        } catch (error) {
          log(`⚠️  Lỗi khi recreate index user_1: ${error.message}`, colors.yellow);
        }
      }
    }

    log("\n✅ Migration hoàn tất!", colors.green);
  } catch (error) {
    log(`\n❌ Lỗi migration: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log("\n🔌 Đã đóng kết nối MongoDB", colors.blue);
    process.exit(0);
  }
}

// Chạy migration
migratePrinterProfileIndexes();

