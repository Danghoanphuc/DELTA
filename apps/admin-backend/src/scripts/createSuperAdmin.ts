// apps/admin-backend/src/scripts/createSuperAdmin.ts
import mongoose from "mongoose";
import "dotenv/config"; // Nạp file .env (rất quan trọng)
import { Admin } from "../models/admin.model.js";

const createSuperAdmin = async () => {
  // 1. Lấy thông tin từ .env (dùng key của Phúc)
  const MONGO_URI = process.env.MONGODB_CONNECTIONSTRING;
  const EMAIL = process.env.SUPERADMIN_EMAIL;
  const PASSWORD = process.env.SUPERADMIN_PASSWORD;

  if (!MONGO_URI || !EMAIL || !PASSWORD) {
    console.error(
      "❌ Lỗi: Thiếu MONGODB_CONNECTIONSTRING, SUPERADMIN_EMAIL, hoặc SUPERADMIN_PASSWORD trong file .env"
    );
    process.exit(1);
  }

  try {
    // 2. Kết nối DB
    await mongoose.connect(MONGO_URI);
    console.log("✅ (Script) Connected to MongoDB.");

    // 3. Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await Admin.findOne({ email: EMAIL });
    if (existingAdmin) {
      console.warn("⚠️ (Script) Super Admin với email này đã tồn tại:", EMAIL);
      process.exit(0);
    }

    // 4. Tạo admin mới
    console.log(`Đang tạo Super Admin với email: ${EMAIL}...`);
    const superAdmin = new Admin({
      email: EMAIL,
      password: PASSWORD, // (Model sẽ tự động hash)
      displayName: "Phuc Super Admin",
      role: "superadmin",
      isActive: true,
    });

    await superAdmin.save();
    console.log("✅ (Script) Tạo Super Admin thành công!", superAdmin.email);
  } catch (error) {
    console.error("❌ (Script) Lỗi khi tạo Super Admin:", error);
  } finally {
    // 5. Ngắt kết nối
    await mongoose.disconnect();
    console.log("✅ (Script) Disconnected from MongoDB.");
    process.exit(0);
  }
};

// Chạy script
createSuperAdmin();
