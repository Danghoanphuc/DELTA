// apps/admin-backend/src/scripts/createSuperAdmin.ts
import mongoose from "mongoose";
import { Admin } from "../models/admin.model.js";
import { config } from "../config/env.config.js";
import { Logger } from "../shared/utils/logger.js";

const createSuperAdmin = async () => {
  // ✅ IMPROVEMENT: Use config instead of direct env access
  const MONGO_URI = config.db.connectionString;
  const EMAIL = config.superAdmin.email;
  const PASSWORD = config.superAdmin.password;

  if (!EMAIL || !PASSWORD) {
    Logger.error(
      "Thiếu SUPERADMIN_EMAIL hoặc SUPERADMIN_PASSWORD trong file .env"
    );
    process.exit(1);
  }

  try {
    // 2. Kết nối DB
    await mongoose.connect(MONGO_URI);
    Logger.success("Script connected to MongoDB");

    // 3. Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await Admin.findOne({ email: EMAIL });
    if (existingAdmin) {
      Logger.warn(`Super Admin với email này đã tồn tại: ${EMAIL}`);
      process.exit(0);
    }

    // 4. Tạo admin mới
    Logger.info(`Đang tạo Super Admin với email: ${EMAIL}...`);
    const superAdmin = new Admin({
      email: EMAIL,
      password: PASSWORD, // (Model sẽ tự động hash)
      displayName: "Phuc Super Admin",
      role: "superadmin",
      isActive: true,
    });

    await superAdmin.save();
    Logger.success(`Tạo Super Admin thành công! Email: ${superAdmin.email}`);
  } catch (error) {
    Logger.error("Lỗi khi tạo Super Admin", error);
  } finally {
    // 5. Ngắt kết nối
    await mongoose.disconnect();
    Logger.success("Script disconnected from MongoDB");
    process.exit(0);
  }
};

// Chạy script
createSuperAdmin();
