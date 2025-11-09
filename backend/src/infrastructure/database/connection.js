// backend/src/infrastructure/database/connection.js
// BÀN GIAO: Đổi sang NAMED EXPORT (thêm const, bỏ default)

import mongoose from "mongoose";
import { envConfig } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";

// ✅ SỬA: Thêm "export const" vào đây
export const connectToDatabase = async () => {
  const connectionString = envConfig.MONGODB_CONNECTIONSTRING;

  if (!connectionString) {
    Logger.error("❌ LỖI NGHIÊM TRỌNG: Thiếu MONGODB_CONNECTIONSTRING.");
    process.exit(1); // Thoát ứng dụng
  }

  try {
    await mongoose.connect(connectionString, {
      // Tùy chọn MongoDB (nếu cần)
      // useNewUrlParser: true, // (Các driver mới không cần)
      // useUnifiedTopology: true, // (Các driver mới không cần)
    });

    Logger.info("✅ Đã kết nối MongoDB Atlas thành công!");

    // Bật chế độ debug query nếu ở môi trường dev
    if (envConfig.NODE_ENV === "development") {
      mongoose.set("debug", (collectionName, method, query, doc) => {
        Logger.debug(
          `[Mongoose] ${collectionName}.${method}(${JSON.stringify(
            query
          )}, ${JSON.stringify(doc)})`
        );
      });
    }
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
// export default connectToDatabase;
