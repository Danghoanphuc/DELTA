// src/server.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import MongoStore from "connect-mongo";
import http from "http";
import helmet from "helmet";
import morgan from "morgan";

// ✅ GIẢI PHÁP: Import cookieParser
import cookieParser from "cookie-parser";

// Import kết nối và config
import { connectToDatabase as connectDB } from "./infrastructure/database/connection.js";
import { connectToRedis } from "./infrastructure/cache/redis.js";
import { config } from "./config/env.config.js";

// Import middleware và utils
import { errorHandler } from "./shared/middleware/error-handler.middleware.js";
import { Logger } from "./shared/utils/index.js";
import { NotFoundException } from "./shared/exceptions/index.js";
import { isPrinter, protect } from "./shared/middleware/index.js";

// (Import passport config)
import "./infrastructure/auth/passport.config.js";

// (Tạm thời tắt nếu chưa dùng)
// import { initQueues } from './config/queue.config.js';

// === KHÔNG IMPORT ROUTES Ở ĐÂY (ĐỂ TRÁNH RACE CONDITION) ===

// ✅ GIẢI PHÁP TỔNG THỂ: TÁCH HÀM KHỞI TẠO (Clean Startup)
async function startServer() {
  try {
    // --- 1. KẾT NỐI CÁC DỊCH VỤ NỀN TẢNG (DB, Cache) ---
    await connectDB();
    await connectToRedis();
    // await initQueues();
    Logger.info("✅ Đã kết nối Database & Redis thành công.");

    // --- 2. IMPORT ROUTES (DYNAMIC IMPORT) ---
    // (Import động vẫn giữ nguyên)
    const authRoutes = (await import("./modules/auth/auth.routes.js")).default;
    const oauthRoutes = (await import("./modules/auth/auth-oauth.routes.js"))
      .default;
    const userRoutes = (await import("./modules/users/user.routes.js")).default;
    const printerRoutes = (await import("./modules/printers/printer.routes.js"))
      .default;
    const productRoutes = (await import("./modules/products/product.routes.js"))
      .default;
    const assetRoutes = (await import("./modules/assets/asset.routes.js"))
      .default;
    const mediaAssetRoutes = (
      await import("./modules/media-assets/media-asset.routes.js")
    ).default;
    const designRoutes = (await import("./modules/designs/design.routes.js"))
      .default;
    const cartRoutes = (await import("./modules/cart/cart.routes.js")).default;
    const orderRoutes = (await import("./modules/orders/order.routes.js"))
      .default;
    const studioRoutes = (
      await import("./modules/printer-studio/studio.routes.js")
    ).default;
    const pdfRenderRoutes = (
      await import("./modules/printer-studio/pdf-render/pdf-render.routes.js")
    ).default;
    const chatRoutes = (await import("./modules/chat/chat.routes.js")).default;
    const uploadRoutes = (await import("./modules/uploads/upload.routes.js"))
      .default;
    const customerRoutes = (
      await import("./modules/customer/customer.routes.js")
    ).default;
    const checkoutRoutes = (
      await import("./modules/checkout/checkout.routes.js")
    ).default;
    const printerStripeRoutes = (
      await import("./routes/printer.stripe.routes.js")
    ).default;
    const webhookStripeRoutes = (
      await import("./routes/webhook.stripe.routes.js")
    ).default;
    const vnpayWebhookRoutes = (
      await import("./modules/webhooks/vnpay.webhook.routes.js")
    ).default;

    Logger.info("✅ Đã tải (import) routes động thành công.");

    // --- 3. KHỞI TẠO APP VÀ MIDDLEWARE ---
    const app = express();
    const server = http.createServer(app);

    app.use(
      cors({
        origin: [config.clientUrl],
        credentials: true,
      })
    );
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(express.urlencoded({ extended: true }));

    app.use(
      "/api/webhooks/stripe",
      express.raw({ type: "application/json" }),
      webhookStripeRoutes
    );

    app.use(express.json());

    // ✅ GIẢI PHÁP: Thêm cookieParser() tại đây
    // (Phải đứng trước 'session' và 'routes' để req.cookies hoạt động)
    app.use(cookieParser());

    // --- 4. CẤU HÌNH SESSION (SAU MIDDLEWARE, TRƯỚC ROUTE) ---
    app.use(
      session({
        secret: config.auth.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: config.db.connectionString,
          ttl: 14 * 24 * 60 * 60, // 14 days
          autoRemove: "native",
        }),
        cookie: {
          secure: config.env === "production",
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
        },
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // --- 5. ĐỊNH NGHĨA ROUTES ---
    // (Giữ nguyên)
    const apiRouter = express.Router();
    apiRouter.use("/auth", authRoutes, oauthRoutes);
    apiRouter.use("/users", protect, userRoutes);
    apiRouter.use("/printers", printerRoutes);
    apiRouter.use("/products", productRoutes);
    apiRouter.use("/assets", protect, assetRoutes);
    apiRouter.use("/media-assets", protect, mediaAssetRoutes);
    apiRouter.use("/designs", protect, designRoutes);
    apiRouter.use("/cart", protect, cartRoutes);
    apiRouter.use("/orders", protect, orderRoutes);
    apiRouter.use("/studio", protect, isPrinter, studioRoutes);
    apiRouter.use("/pdf-render", protect, isPrinter, pdfRenderRoutes);
    apiRouter.use("/chat", protect, chatRoutes);
    apiRouter.use("/uploads", protect, uploadRoutes);
    apiRouter.use("/customer", protect, customerRoutes);
    apiRouter.use("/checkout", protect, checkoutRoutes);
    apiRouter.use("/printer-stripe", protect, isPrinter, printerStripeRoutes);
    apiRouter.use("/webhooks/vnpay", vnpayWebhookRoutes);

    app.use("/api", apiRouter);

    // === Health Check ===
    app.get("/", (req, res) => {
      res.status(200).json({
        status: "success",
        message: "Welcome to PrintZ API (Customer Backend)",
      });
    });

    // --- 6. XỬ LÝ LỖI (CUỐI CÙNG) ---
    // (Giữ nguyên)
    app.all(/.*/, (req, res, next) => {
      next(
        new NotFoundException(`Không tìm thấy đường dẫn: ${req.originalUrl}`)
      );
    });

    app.use(errorHandler);

    // --- 7. LẮNG NGHE ---
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      Logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    Logger.error("❌ Lỗi khởi động server nghiêm trọng:", error);
    process.exit(1); // Thoát nếu không kết nối được DB/Redis
  }
}

// --- BẮT ĐẦU CHẠY SERVER ---
const runningServer = startServer();

export default runningServer; // Export promise chứa server
