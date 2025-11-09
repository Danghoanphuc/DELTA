// backend/src/server.js
// BÀN GIAO: Đã xóa import 'validateEnv' (gây lỗi deploy)

import "dotenv/config"; // <-- Tốt nhất nên giữ lại để dự phòng
import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";

import { connectToDatabase } from "./infrastructure/database/connection.js";
// ✅ SỬA: Xóa 'validateEnv' vì file config đã tự chạy
import { envConfig } from "./config/env.config.js";
import { errorHandler } from "./shared/middleware/error-handler.middleware.js";

// Import các modules routes
import authRoutes from "./modules/auth/auth.routes.js";
import oauthRoutes from "./modules/auth/auth-oauth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import printerRoutes from "./modules/printers/printer.routes.js";
import printerProfileRoutes from "./modules/printers/printer.profile.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import assetRoutes from "./modules/assets/asset.routes.js";
import mediaAssetRoutes from "./modules/media-assets/media-asset.routes.js";
import designRoutes from "./modules/designs/design.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import studioRoutes from "./modules/printer-studio/studio.routes.js";
import pdfRenderRoutes from "./modules/printer-studio/pdf-render/pdf-render.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";

// == Cấu hình Server ==
// ✅ SỬA: XÓA DÒNG 'validateEnv();' GÂY LỖI.
// File env.config.js mới đã tự chạy hàm check này rồi.
const app = express();

// == Cấu hình CORS ==
// (Đoạn này đã đúng, lấy từ file gốc của anh)
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép dev (origin là undefined) và CLIENT_URL
      if (!origin || origin === envConfig.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error("Bị chặn bởi CORS"));
      }
    },
    credentials: true,
  })
);

// == Middlewares ==
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// == Kết nối Database ==
connectToDatabase();

// == Đăng ký Routes ==
app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes); // /google, /google/callback
app.use("/api/users", userRoutes);
app.use("/api/printers", printerRoutes); // public
app.use("/api/printer-profile", printerProfileRoutes); // private
app.use("/api/products", productRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/media-assets", mediaAssetRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/studio", studioRoutes);
T app.use("/api/pdf-render", pdfRenderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/uploads", uploadRoutes);

// == Route kiểm tra sức khoẻ ==
app.get("/", (req, res) => {
  res.status(200).json({
    message: `DELTA API v1.0 - Môi trường: ${envConfig.NODE_ENV}`,
  });
});

// == Middleware Xử lý Lỗi (Phải đặt cuối cùng) ==
app.use(errorHandler);

// == Khởi động Server ==
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT} (Môi trường: ${envConfig.NODE_ENV})`);
});

export default app;