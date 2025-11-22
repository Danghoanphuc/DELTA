// src/server.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import session from "express-session";
import passport from "passport";
import cors, { type CorsOptions } from "cors";
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

    // ✅ Import Real-time Services (dynamic import after DB connection)
    const { socketService } = await import(
      "./infrastructure/realtime/socket.service.js"
    );
    const { initChangeStreams } = await import(
      "./infrastructure/database/change-streams.js"
    );

    // ✅ SECURITY: Import Rate Limiting
    const { initRateLimiters, generalRateLimiter } = await import(
      "./shared/middleware/rate-limit.middleware.js"
    );

    // ✅ MAINTENANCE: Import Cron Jobs
    const { initCronJobs } = await import(
      "./infrastructure/cron/cron.service.js"
    );

    const allowedOrigins = config.clientUrls;

    // --- 2. IMPORT ROUTES (DYNAMIC IMPORT) ---
    // (Import động vẫn giữ nguyên)
    const authRoutes = (await import("./modules/auth/auth.routes.js")).default;
    const oauthRoutes = (await import("./modules/auth/auth-oauth.routes.js"))
      .default;
    const userRoutes = (await import("./modules/users/user.routes.js")).default;
    const connectionRoutes = (await import("./modules/connections/connection.routes.js")).default;
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
    const stripeOnboardingRoutes = (
      await import("./modules/payments/stripe.onboarding.routes.js")
    ).default;
    const stripeWebhookRoutes = (
      await import("./modules/payments/stripe.webhook.routes.js")
    ).default;
    const momoRoutes = (
      await import("./modules/payments/momo/momo.routes.js")
    ).default;
    const payosRoutes = (await import("./modules/payments/payos/payos.routes.js"))
      .default;
    const notificationRoutes = (
      await import("./modules/notifications/notification.routes.js")
    ).default;
    // ✨ SMART PIPELINE: AI routes
    const aiRoutes = (await import("./modules/ai/ai.routes.js")).default;
    const walletRoutes = (await import("./modules/wallet/wallet.routes.js"))
      .default;
    const printerDashboardRoutes = (
      await import("./modules/printer-studio/printer-dashboard.routes.js")
    ).default;

    Logger.info("✅ Đã tải (import) routes động thành công.");

    // --- 3. KHỞI TẠO APP VÀ MIDDLEWARE ---
    const app = express();
    const server = http.createServer(app);

    // ✅ Tăng timeout cho upload ảnh (3 phút)
    server.timeout = 180000; // 3 minutes = 180,000ms
    server.keepAliveTimeout = 185000; // Slightly higher than timeout
    server.headersTimeout = 186000; // Slightly higher than keepAliveTimeout

    app.set("trust proxy", 1);
    const corsOptions: CorsOptions = {
      origin(
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        Logger.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(
          new Error(
            `Origin ${origin} is not allowed. Check CLIENT_URL(S) configuration.`
          )
        );
      },
      credentials: true,
    };

    app.use(cors(corsOptions));
    // ✅ SECURITY FIX: Cấu hình helmet an toàn hơn - loại bỏ unsafe-inline và unsafe-eval
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // ✅ Loại bỏ unsafe-inline và unsafe-eval để tránh XSS
            styleSrc: ["'self'", "'unsafe-inline'"], // Chỉ cho phép inline CSS (ít nguy hiểm hơn)
            imgSrc: ["'self'", "data:", "https:", "blob:"], // Cho phép images từ CDN
            connectSrc: ["'self'", config.clientUrl], // Cho phép API calls
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
            frameAncestors: ["'self'"], // ✅ Chỉ cho phép same-origin, không dùng "*" wildcard
          },
        },
        crossOriginEmbedderPolicy: false, // Giữ false cho OAuth popup
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // ✅ Cải thiện: cho phép popup nhưng vẫn bảo mật
      })
    );
    app.use(morgan("dev"));

    // ✅ SECURITY: Initialize rate limiters after Redis connection
    initRateLimiters();

    // ✅ SECURITY: Apply general rate limiting globally (before routes)
    app.use(generalRateLimiter);
    
    // ✅ Tăng limit cho body parser (50MB) vì upload nhiều ảnh
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    app.use(
      "/api/webhooks/stripe",
      express.raw({ type: "application/json" }),
      stripeWebhookRoutes
    );

    // ✅ Tăng limit cho JSON body (50MB)
    app.use(express.json({ limit: "50mb" }));

    // ✅ GIẢI PHÁP: Thêm cookieParser() tại đây
    // (Phải đứng trước 'session' và 'routes' để req.cookies hoạt động)
    app.use(cookieParser());

    // ✅ Middleware timeout handler cho các request upload
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Chỉ áp dụng timeout dài cho các route upload
      if (req.path.includes("/products") && req.method === "POST") {
        // Không set timeout - để server.timeout xử lý
        req.setTimeout(180000); // 3 minutes
      }
      next();
    });

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
    apiRouter.use("/connections", protect, connectionRoutes); // ✅ SOCIAL: Connection routes
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
    apiRouter.use("/printer-stripe", protect, isPrinter, stripeOnboardingRoutes);
    apiRouter.use("/payments/momo", momoRoutes);
    apiRouter.use("/payments/payos", payosRoutes);
    apiRouter.use("/payos", payosRoutes); // ✅ Alias để tương thích với frontend
    apiRouter.use("/notifications", notificationRoutes);
    apiRouter.use("/wallet", protect, isPrinter, walletRoutes);
    apiRouter.use("/printer", protect, isPrinter, printerDashboardRoutes);
    // ✨ SMART PIPELINE: AI routes
    apiRouter.use("/ai", aiRoutes);

    app.use("/api", apiRouter);

    // === Health Check ===
    app.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Welcome to PrintZ API (Customer Backend)",
      });
    });

    // --- 6. XỬ LÝ LỖI (CUỐI CÙNG) ---
    // (Giữ nguyên)
    app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
      next(
        new NotFoundException(`Không tìm thấy đường dẫn: ${req.originalUrl}`)
      );
    });

    app.use(errorHandler);

    // --- 7. KHỞI TẠO REAL-TIME SERVICES ---
    // Initialize Socket.io (before listening)
    socketService.initialize(server);
    Logger.success("✅ Socket.io initialized");

    // Initialize MongoDB Change Streams
    initChangeStreams();
    Logger.success("✅ Change Streams initialized");

    // ✅ MAINTENANCE: Initialize Cron Jobs
    initCronJobs();
    Logger.success("✅ Cron jobs initialized");

    // --- 8. LẮNG NGHE ---
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      Logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      Logger.info(`🔌 Socket.io ready at ws://localhost:${PORT}`);
    });

    // ✅ Health check endpoint for real-time services
    app.get("/api/realtime/health", (req: Request, res: Response) => {
      try {
        const io = socketService.getIO();
        const clientsCount = io.engine.clientsCount;
        res.status(200).json({
          status: "ok",
          socketio: {
            connected: clientsCount > 0,
            connectedClients: clientsCount,
          },
          changeStreams: "active",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        Logger.error("[Health] Socket.io not initialized", error);
        res.status(503).json({
          status: "error",
          message: "Socket.io not initialized",
          timestamp: new Date().toISOString(),
        });
      }
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
