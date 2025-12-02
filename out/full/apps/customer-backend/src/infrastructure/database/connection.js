// backend/src/infrastructure/database/connection.js
// BÀN GIAO: Đổi sang NAMED EXPORT (thêm const, bỏ default)

import mongoose from "mongoose";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";

// ✅ SỬA: Thêm "export const" vào đây
export const connectToDatabase = async () => {
  const connectionString = config.db.connectionString;

  if (!connectionString) {
    Logger.error("❌ LỖI NGHIÊM TRỌNG: Thiếu MONGODB_CONNECTIONSTRING.");
    process.exit(1); // Thoát ứng dụng
  }

  try {
    await mongoose.connect(connectionString, {
      // Tùy chọn MongoDB (nếu cần)
    });

    Logger.info("✅ Đã kết nối MongoDB Atlas thành công!");

    // =========================================================
    // === ✅ GIẢI PHÁP: Tắt log spam Mongoose ===
    // (Vô hiệu hóa khối này để làm gọn terminal)
    /*
    if (config.env === "development") {
      mongoose.set("debug", (collectionName, method, query, doc) => {
        Logger.debug(
          `[Mongoose] ${collectionName}.${method}(${JSON.stringify(
            query
          )}, ${JSON.stringify(doc)})`
        );
      });
    }
    */
    // =========================================================
  } catch (error) {
    Logger.error("❌ Kết nối MongoDB thất bại:", error);
    process.exit(1); // Thoát nếu không kết nối được
  }
};

mongoose.connection.on("error", (err) => {
  Logger.error("❌ Lỗi Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  Logger.warn("MongoDB đã ngắt kết nối.");
});

// ✅ SỬA: Bỏ dòng "export default" ở cuối
