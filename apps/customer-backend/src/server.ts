// src/server.ts
process.stdout.write("[Server] ⚡ File loaded, starting imports...\n");
console.log("[Server] ⚡ File loaded, starting imports...");

// ✅ Import Sentry trước tiên
process.stdout.write("[Server] 📦 Importing Sentry instrument...\n");
console.log("[Server] 📦 Importing Sentry instrument...");
import "./infrastructure/instrument.js";
process.stdout.write("[Server] ✅ Sentry instrument imported\n");
console.log("[Server] ✅ Sentry instrument imported");

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import * as Sentry from "@sentry/node";
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
import { isPrinter, protect, optionalAuth } from "./shared/middleware/index.js";

// (Import passport config)
import "./infrastructure/auth/passport.config.js";
// (Tạm thời tắt nếu chưa dùng)
// import { initQueues } from './config/queue.config.js';

// === KHÔNG IMPORT ROUTES Ở ĐÂY (ĐỂ TRÁNH RACE CONDITION) ===

// ✅ GIẢI PHÁP TỔNG THỂ: TÁCH HÀM KHỞI TẠO (Clean Startup)
async function startServer() {
  console.log("[Server] 🚀 startServer() called");
  try {
    // --- 1. KẾT NỐI CÁC DỊCH VỤ NỀN TẢNG (DB, Cache) ---
    console.log("[Server] 📡 Connecting to database...");
    await connectDB();
    console.log("[Server] ✅ Database connected");

    // --- 1.5. REGISTER APPLICATION HOOKS ---
    console.log("[Server] 🔗 Registering application hooks...");
    try {
      const { registerAllHooks } = await import("./config/register-hooks.js");
      registerAllHooks();
      console.log("[Server] ✅ Application hooks registered");
    } catch (hookError) {
      Logger.error("[Server] ❌ Failed to register hooks:", hookError);
      // Continue server startup even if hooks fail
    }

    console.log("[Server] 📡 Connecting to Redis...");
    const redisClient = await connectToRedis();
    if (redisClient) {
      console.log("[Server] ✅ Redis connected");
      Logger.info("✅ Đã kết nối Database & Redis thành công.");
    } else {
      console.log("[Server] ⚠️ Redis unavailable - continuing without Redis");
      Logger.warn(
        "⚠️ Redis không khả dụng. Server sẽ chạy với chức năng hạn chế (no caching, no rate limiting, no queues)."
      );
    }

    // =========================================================================
    // ❌ URL PREVIEW WORKER - DISABLED (Upstash quota exceeded)
    // =========================================================================
    // Tạm thời tắt để tiết kiệm Redis quota
    // Sẽ bật lại khi: 1) Đầu tháng sau (quota reset) hoặc 2) Upgrade Redis plan
    Logger.warn("⚠️ [Server] URL Preview Worker DISABLED to save Redis quota");

    // try {
    //   Logger.info("[Server] 📦 Đang import url-preview.worker.js...");
    //   const { startUrlPreviewWorker } = await import(
    //     "./infrastructure/queue/url-preview.worker.js"
    //   );
    //   Logger.info("[Server] ✅ Đã import url-preview.worker.js");
    //   const urlWorker = startUrlPreviewWorker();
    //   if (urlWorker) {
    //     Logger.info("✅ URL Preview Worker đã sẵn sàng (concurrency: 1)");
    //   } else {
    //     Logger.warn("⚠️ URL Preview Worker không khởi động được (Redis issue?)");
    //   }
    // } catch (queueError) {
    //   Logger.error("❌ Lỗi khi khởi chạy URL Preview Worker:", queueError);
    // }

    // =========================================================================
    // ✅ NOTIFICATION WORKER - RE-ENABLED with Circuit Breaker
    // =========================================================================
    try {
      Logger.info("[Server] 📦 Đang import notification.worker.js...");
      const { startNotificationWorker } = await import(
        "./infrastructure/queue/notification.worker.js"
      );
      Logger.info("[Server] ✅ Đã import notification.worker.js");
      const worker = startNotificationWorker();
      if (worker) {
        Logger.info(
          "✅ Notification Worker đã sẵn sàng (with circuit breaker)"
        );
      } else {
        Logger.warn(
          "⚠️ Notification Worker không khởi động được (Redis có thể không có)"
        );
      }
    } catch (notificationWorkerError) {
      Logger.error(
        "❌ Lỗi khi khởi chạy Notification Worker:",
        notificationWorkerError
      );
      Logger.error(
        "Stack:",
        notificationWorkerError instanceof Error
          ? notificationWorkerError.stack
          : "No stack"
      );
      Logger.warn(
        "⚠️ Server sẽ tiếp tục khởi động nhưng Notification sẽ không hoạt động"
      );
    }

    // ✅ CRITICAL: Global error handlers (nằm NGOÀI try-catch trên)
    // Đặt sau worker registration để bắt mọi unhandled errors
    process.on("unhandledRejection", (reason, promise) => {
      Logger.error(`[Process] ⚠️ Unhandled Rejection:`, {
        reason: reason,
        promise: promise,
      });
      // ✅ KHÔNG exit - chỉ log
    });

    process.on("uncaughtException", (error) => {
      Logger.error(`[Process] ⚠️ Uncaught Exception:`, {
        message: error.message,
        stack: error.stack,
      });
      // ✅ KHÔNG exit - chỉ log
    });

    // ✅ IMPORT QUEUES & WORKERS (sau khi Redis đã kết nối)
    // Import queue.config.js để có Bull Board UI và PDF Queue
    try {
      await import("./config/queue.config.js");
      Logger.info("✅ Đã khởi chạy Queue Workers (PDF Renderer, URL Preview).");
    } catch (queueConfigError) {
      Logger.error("❌ Lỗi khi import queue.config.js:", queueConfigError);
      // ✅ Không throw để server vẫn có thể chạy
    }

    // ✅ Import Real-time Services (dynamic import after DB connection)
    // ✅ NOTE: socketService sẽ được import và initialize sau khi tạo HTTP server
    Logger.debug("📦 [Server] Importing change streams...");
    const { initChangeStreams } = await import(
      "./infrastructure/database/change-streams.js"
    );
    Logger.debug("✅ [Server] Change streams imported");

    // ✅ SECURITY: Import Rate Limiting
    Logger.debug("📦 [Server] Importing rate limiters...");
    const { initRateLimiters, generalRateLimiter } = await import(
      "./shared/middleware/rate-limit.middleware.js"
    );
    Logger.debug("✅ [Server] Rate limiters imported");

    // ✅ MAINTENANCE: Import Cron Jobs
    Logger.debug("📦 [Server] Importing cron jobs...");
    const { initCronJobs } = await import(
      "./infrastructure/cron/cron.service.js"
    );
    Logger.debug("✅ [Server] Cron jobs imported");

    const allowedOrigins = config.clientUrls;

    // ✅ CẢI THIỆN: Thêm các origin dev mặc định (127.0.0.1 và localhost)
    const devOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
    ];

    // --- 2. IMPORT ROUTES (DYNAMIC IMPORT) ---
    Logger.debug("📦 [Server] Importing routes...");
    // Khai báo các biến routes ở ngoài để có thể sử dụng sau
    let authRoutes,
      oauthRoutes,
      shipperAuthRoutes,
      userRoutes,
      connectionRoutes,
      printerRoutes,
      locationRoutes;
    let assetRoutes, mediaAssetRoutes;
    let cartRoutes, orderRoutes, studioRoutes, pdfRenderRoutes;
    let chatRoutes,
      uploadRoutes,
      customerRoutes,
      checkoutRoutes,
      customerProfileRoutes;
    let payosRoutes;
    let notificationRoutes,
      aiRoutes,
      walletRoutes,
      rushRoutes,
      printerDashboardRoutes;
    let organizationRoutes, organizationMemberRoutes;
    let recipientRoutes, swagPackRoutes, inventoryRoutes;
    let swagOrderRoutes, teamRoutes, approvalRoutes;
    let deliveryCheckinRoutes;
    let threadRoutes, messageRoutes, templateRoutes;
    let contactRequestRoutes;
    let magazineRoutes;

    try {
      // Import all routes silently (no individual logs)
      authRoutes = (await import("./modules/auth/auth.routes.js")).default;
      oauthRoutes = (await import("./modules/auth/auth-oauth.routes.js"))
        .default;
      shipperAuthRoutes = (
        await import("./modules/auth/shipper-auth.routes.js")
      ).default;
      userRoutes = (await import("./modules/users/user.routes.js")).default;
      connectionRoutes = (
        await import("./modules/connections/connection.routes.js")
      ).default;
      printerRoutes = (await import("./modules/printers/printer.routes.js"))
        .default;
      // ✅ REMOVED: productRoutes - Products now served from admin-backend via public catalog API
      assetRoutes = (await import("./modules/assets/asset.routes.js")).default;
      mediaAssetRoutes = (
        await import("./modules/media-assets/media-asset.routes.js")
      ).default;
      cartRoutes = (await import("./modules/cart/cart.routes.js")).default;
      orderRoutes = (await import("./modules/orders/order.routes.js")).default;
      studioRoutes = (await import("./modules/printer-studio/studio.routes.js"))
        .default;
      pdfRenderRoutes = (
        await import("./modules/printer-studio/pdf-render/pdf-render.routes.js")
      ).default;
      chatRoutes = (await import("./modules/chat/chat.routes.js")).default;
      uploadRoutes = (await import("./modules/uploads/upload.routes.js"))
        .default;
      customerRoutes = (await import("./modules/customer/customer.routes.js"))
        .default;
      checkoutRoutes = (await import("./modules/checkout/checkout.routes.js"))
        .default;
      customerProfileRoutes = (
        await import("./modules/customer-profile/customer-profile.routes.js")
      ).default;
      payosRoutes = (await import("./modules/payments/payos/payos.routes.js"))
        .default;
      notificationRoutes = (
        await import("./modules/notifications/notification.routes.js")
      ).default;
      aiRoutes = (await import("./modules/ai/ai.routes.js")).default;
      walletRoutes = (await import("./modules/wallet/wallet.routes.js"))
        .default;
      rushRoutes = (await import("./modules/rush/rush.routes.js")).default;
      printerDashboardRoutes = (
        await import("./modules/printer-studio/printer-dashboard.routes.js")
      ).default;
      locationRoutes = (await import("./modules/location/location.routes.js"))
        .default;
      magazineRoutes = (await import("./modules/magazine/magazine.routes.js"))
        .default;
      var artisanRoutes = (await import("./modules/artisan/artisan.routes.js"))
        .default;
      // ✅ PUBLIC CATALOG: Products & Categories (same as admin-backend)
      var publicCatalogRoutes = (
        await import("./modules/catalog/public-catalog.routes.js")
      ).default;
      organizationRoutes = (
        await import("./modules/organizations/organization.routes.js")
      ).default;
      organizationMemberRoutes = (
        await import("./modules/organizations/organization-member.routes.js")
      ).default;
      recipientRoutes = (
        await import("./modules/recipients/recipient.routes.js")
      ).default;
      swagPackRoutes = (
        await import("./modules/swag-packs/swag-pack.routes.js")
      ).default;
      inventoryRoutes = (
        await import("./modules/inventory/inventory.routes.js")
      ).default;
      swagOrderRoutes = (
        await import("./modules/swag-orders/swag-order.routes.js")
      ).default;
      deliveryCheckinRoutes = (
        await import("./modules/delivery-checkin/delivery-checkin.routes.js")
      ).default;
      var deliveryThreadRoutes = (
        await import("./modules/delivery-thread/delivery-thread.routes.js")
      ).default;
      var orderThreadRoutes = (
        await import("./modules/order-thread/order-thread.routes.js")
      ).default;
      teamRoutes = (await import("./modules/organizations/team.routes.js"))
        .default;
      approvalRoutes = (await import("./modules/approvals/approval.routes.js"))
        .default;
      var redemptionRoutes = (
        await import("./modules/redemption/redemption.routes.js")
      ).default;
      var companyStoreRoutes = (
        await import("./modules/company-store/company-store.routes.js")
      ).default;
      threadRoutes = (await import("./routes/thread.routes.js")).default;
      messageRoutes = (await import("./routes/message.routes.js")).default;
      var participantRoutes = (await import("./routes/participant.routes.js"))
        .default;
      var searchRoutes = (await import("./routes/search.routes.js")).default;
      var filterRoutes = (await import("./routes/filter.routes.js")).default;
      templateRoutes = (await import("./routes/template.routes.js")).default;
      var quickActionRoutes = (await import("./routes/quick-action.routes.js"))
        .default;
      contactRequestRoutes = (
        await import("./modules/contact-requests/contact-request.routes.js")
      ).default;
      Logger.info("✅ [Server] Routes imported successfully");
    } catch (routeError) {
      Logger.error("❌ Lỗi khi import routes:", routeError);
      Logger.error(
        "Stack trace:",
        routeError instanceof Error ? routeError.stack : "No stack trace"
      );
      throw routeError; // Re-throw để catch block bên ngoài xử lý
    }

    // --- 3. KHỞI TẠO APP VÀ MIDDLEWARE ---
    Logger.debug("🚀 [Server] Khởi tạo Express app...");
    const app = express();
    const server = http.createServer(app);
    Logger.debug("✅ [Server] Express app đã được khởi tạo");

    // ✅ Tăng timeout cho upload ảnh (3 phút)
    server.timeout = 180000; // 3 minutes = 180,000ms
    server.keepAliveTimeout = 185000; // Slightly higher than timeout
    server.headersTimeout = 186000; // Slightly higher than keepAliveTimeout

    // ✅ Initialize Pusher Service (no-op, giữ lại để tương thích)
    const { socketService } = await import(
      "./infrastructure/realtime/pusher.service.js"
    );
    socketService.initialize(server);

    app.set("trust proxy", 1);

    // ---------------------------------------------------------
    // 1. LOGGER MIDDLEWARE
    // Request logging - only in development or when LOG_LEVEL=INFO
    // ---------------------------------------------------------
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Skip logging for health checks and static assets
      if (req.url === "/health" || req.url.startsWith("/static")) {
        return next();
      }

      // Only log in development or when explicitly enabled
      if (
        process.env.NODE_ENV !== "production" ||
        process.env.LOG_LEVEL === "INFO"
      ) {
        console.log(`👉 [REQUEST] ${req.method} ${req.url}`);
        Logger.info(`[REQUEST] ${req.method} ${req.url}`, {
          ip: req.ip,
          userAgent: req.get("user-agent"),
        });
      }
      next();
    });
    const corsOptions: CorsOptions = {
      origin(
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) {
        // Cho phép requests không có origin (Postman, curl, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Kiểm tra trong danh sách allowed origins từ config
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // ✅ CẢI THIỆN: Cho phép các origin dev mặc định (127.0.0.1 và localhost)
        if (config.env !== "production" && devOrigins.includes(origin)) {
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
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
    // Skip logging for health checks to reduce noise
    app.use(
      morgan("dev", {
        skip: (req, res) => {
          // Skip health check endpoints
          if (req.url === "/" || req.url.startsWith("/health")) {
            return true;
          }
          // Skip 404s from bots/scanners
          if (res.statusCode === 404) {
            return true;
          }
          return false;
        },
      })
    );

    // ✅ SECURITY: Initialize rate limiters after Redis connection
    initRateLimiters();

    // ✅ SENTRY: Apply context middleware early (after rate limiting)
    const { sentryContextMiddleware } = await import(
      "./shared/middleware/sentry.middleware.js"
    );
    app.use(sentryContextMiddleware);

    // ✅ SECURITY: Apply general rate limiting globally (before routes)
    app.use(generalRateLimiter);

    // ✅ Tăng limit cho body parser (50MB) vì upload nhiều ảnh
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
    // ✅ MONITORING: Health Check endpoints (đặt trước các routes khác)
    Logger.debug("📦 [Server] Importing health routes...");
    const healthRoutes = (await import("./routes/health.routes.js")).default;
    app.use("/", healthRoutes);
    Logger.debug("✅ [Server] Health routes mounted");

    // (Giữ nguyên)
    const apiRouter = express.Router();
    apiRouter.use("/auth", authRoutes, oauthRoutes, shipperAuthRoutes);
    // ✅ CONTACT REQUESTS: Mount FIRST to ensure public access (no auth middleware)
    apiRouter.use("/contact-requests", contactRequestRoutes);
    // ✅ BLOG: Mount FIRST to ensure public access (no auth middleware)
    const blogRoutes = (await import("./modules/blog/blog.routes.js")).default;
    apiRouter.use("/blog", blogRoutes);
    // ✅ SITEMAP: Public sitemap for SEO
    const sitemapRoutes = (await import("./modules/blog/sitemap.routes.js"))
      .default;
    app.use("/", sitemapRoutes); // Mount directly on app, not apiRouter
    apiRouter.use("/users", protect, userRoutes);
    apiRouter.use("/connections", protect, connectionRoutes); // ✅ SOCIAL: Connection routes
    apiRouter.use("/printers", printerRoutes);
    // ✅ REMOVED: /products route - Now served from admin-backend public catalog API
    apiRouter.use("/assets", protect, assetRoutes);
    apiRouter.use("/media-assets", protect, mediaAssetRoutes);
    apiRouter.use("/cart", protect, cartRoutes);
    apiRouter.use("/orders", protect, orderRoutes);
    apiRouter.use("/studio", protect, isPrinter, studioRoutes);
    apiRouter.use("/pdf-render", protect, isPrinter, pdfRenderRoutes);

    // ✅ FIX: Tách route test ra ngoài để không bị chặn bởi protect middleware
    // Route test không cần authentication
    apiRouter.get("/chat/test", (req: Request, res: Response) => {
      Logger.info("[ChatRoutes] Test route called");
      res.json({ success: true, message: "Chat routes are working" });
    });

    // ✅ FIX PRODUCTION: Tách route /chat/stream, /chat/message và /chat/upload ra khỏi protect
    // vì chúng sử dụng optionalAuth (cho phép guest users)
    // Phải mount TRƯỚC route /chat với protect để Express match đúng
    const { chatRateLimiter } = await import(
      "./shared/middleware/rate-limit.middleware.js"
    );
    const { ChatController } = await import(
      "./modules/chat/chat.controller.js"
    );
    const { uploadMixed } = await import(
      "./infrastructure/storage/multer.config.js"
    );
    const { handleUploadError } = await import("./shared/middleware/index.js");
    const chatController = new ChatController();

    // Mount các route không cần protect TRƯỚC
    apiRouter.post(
      "/chat/stream",
      chatRateLimiter,
      optionalAuth,
      chatController.handleChatStream
    );
    apiRouter.post(
      "/chat/message",
      chatRateLimiter,
      optionalAuth,
      chatController.handleChatMessage
    );
    apiRouter.post(
      "/chat/upload",
      optionalAuth,
      uploadMixed.single("file"),
      handleUploadError,
      chatController.handleChatUpload
    );

    // Các route chat khác vẫn cần protect
    apiRouter.use("/chat", protect, chatRoutes);
    apiRouter.use("/uploads", protect, uploadRoutes);
    apiRouter.use("/customer", protect, customerRoutes);
    apiRouter.use("/checkout", protect, checkoutRoutes);
    apiRouter.use("/customer-profile", protect, customerProfileRoutes);
    apiRouter.use("/payments/payos", payosRoutes);
    apiRouter.use("/payos", payosRoutes); // ✅ Alias để tương thích với frontend
    apiRouter.use("/notifications", notificationRoutes);
    apiRouter.use("/wallet", protect, isPrinter, walletRoutes);
    apiRouter.use("/printer", protect, isPrinter, printerDashboardRoutes);
    // ✨ SMART PIPELINE: AI routes
    apiRouter.use("/ai", aiRoutes);
    // ✅ RUSH ORDER: Rush order routes
    apiRouter.use("/rush", rushRoutes);
    // ✅ LOCATION: Geocoding routes (public)
    apiRouter.use("/location", locationRoutes);
    // ✅ TEST: Deployment verification endpoint
    const testDeploymentRoutes = (
      await import("./routes/test-deployment.routes.js")
    ).default;
    apiRouter.use("/test-deployment", testDeploymentRoutes);
    // ✅ MAGAZINE: Public magazine posts (public)
    apiRouter.use("/magazine", magazineRoutes);
    // ✅ ARTISAN: Public artisan/supplier profiles (public)
    apiRouter.use("/artisans", artisanRoutes);
    // ✅ PUBLIC CATALOG: Products & Categories (public - same as admin-backend)
    apiRouter.use("/", publicCatalogRoutes);
    // ✅ ORGANIZATION: B2B Organization routes
    apiRouter.use("/organizations", organizationRoutes);
    // ✅ ORGANIZATION MEMBERS: Team membership management
    apiRouter.use("/organizations", organizationMemberRoutes);
    // ✅ RECIPIENTS: Recipient management routes
    apiRouter.use("/recipients", recipientRoutes);
    // ✅ SWAG PACKS: Swag pack builder routes
    apiRouter.use("/swag-packs", swagPackRoutes);
    // ✅ INVENTORY: Inventory management routes
    apiRouter.use("/inventory", inventoryRoutes);
    // ✅ SWAG ORDERS: Send Swag Flow routes
    apiRouter.use("/swag-orders", swagOrderRoutes);
    // ✅ DELIVERY CHECK-IN: Shipper delivery check-in routes
    apiRouter.use("/delivery-checkins", deliveryCheckinRoutes);
    // ✅ DELIVERY THREAD: Delivery discussion threads
    apiRouter.use("/delivery-threads", deliveryThreadRoutes);
    // ✅ ORDER THREAD: Order-level discussion threads
    apiRouter.use("/order-threads", orderThreadRoutes);
    // ✅ TEAM: Team management routes
    apiRouter.use("/organizations/team", teamRoutes);
    // ✅ APPROVALS: Approval workflow routes
    apiRouter.use("/approvals", approvalRoutes);
    // ✅ REDEMPTION: Redemption links (SwagUp-style)
    apiRouter.use("/redemption", redemptionRoutes);
    // ✅ COMPANY STORE: Company storefront (SwagUp-style)
    apiRouter.use("/company-store", companyStoreRoutes);
    // ✅ THREADED CHAT: Thread management routes
    apiRouter.use("/threads", threadRoutes);
    // ✅ THREADED CHAT: Message routes (includes /threads/:threadId/messages)
    apiRouter.use("/", messageRoutes);
    // ✅ THREADED CHAT: Participant management routes
    apiRouter.use("/", participantRoutes);
    // ✅ THREADED CHAT: Search routes
    apiRouter.use("/search", searchRoutes);
    // ✅ THREADED CHAT: Filter routes (mounted under /threads/filter)
    apiRouter.use("/threads/filter", filterRoutes);
    // ✅ THREADED CHAT: Template routes
    apiRouter.use("/thread-templates", templateRoutes);
    // ✅ THREADED CHAT: Quick Action routes (for ORDER context)
    apiRouter.use("/orders", quickActionRoutes);

    app.use("/api", apiRouter);

    // ✅ QUEUE MONITORING: Bull Board UI (Admin only - có thể thêm protect middleware sau)
    try {
      const { getBullBoardRouter } = await import("./config/queue.config.js");
      const bullBoardRouter = await getBullBoardRouter();
      app.use("/admin/queues", bullBoardRouter);
      Logger.debug("✅ Bull Board UI available at /admin/queues");
    } catch (error) {
      Logger.warn("⚠️ Bull Board router not available:", error);
    }

    // === Health Check ===
    app.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Welcome to PrintZ API (Customer Backend)",
      });
    });

    // --- 6. XỬ LÝ LỖI (CUỐI CÙNG) ---
    app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
      next(
        new NotFoundException(`Không tìm thấy đường dẫn: ${req.originalUrl}`)
      );
    });

    // ✅ QUAN TRỌNG: Đặt Sentry error handler sau tất cả routes, trước error handler của bạn
    // Sentry v8 uses setupExpressErrorHandler() instead of Handlers.errorHandler()
    Sentry.setupExpressErrorHandler(app);

    app.use(errorHandler);

    // Initialize MongoDB Change Streams
    Logger.debug("🔄 [Server] Initializing change streams...");
    initChangeStreams();
    Logger.debug("✅ [Server] Change streams initialized");

    // ✅ MAINTENANCE: Initialize Cron Jobs
    Logger.debug("🔄 [Server] Initializing cron jobs...");
    initCronJobs();
    Logger.debug("✅ [Server] Cron jobs initialized");

    // --- 8. LẮNG NGHE ---
    const PORT: number = parseInt(process.env.PORT || "8000", 10);
    // ✅ FIX: Listen trên 0.0.0.0 để tránh vấn đề IPv6 trên Windows
    // 0.0.0.0 sẽ lắng nghe trên cả IPv4 và IPv6
    server.listen(PORT, "0.0.0.0", () => {
      Logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      Logger.info(`🚀 Server đang chạy tại http://127.0.0.1:${PORT}`);
      Logger.info(`🔌 Pusher ready for real-time communication`);
    });

    // ✅ FIX: Xử lý lỗi port đã được sử dụng
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        Logger.error(`❌ [Server] Port ${PORT} đã được sử dụng!`);
        Logger.error(`💡 Giải pháp:`);
        Logger.error(
          `   1. Kill process cũ: node scripts/kill-port.js ${PORT}`
        );
        Logger.error(`   2. Hoặc thay đổi PORT trong .env file`);
        Logger.error(`   3. Hoặc tìm và kill process thủ công:`);
        if (process.platform === "win32") {
          Logger.error(`      Windows: netstat -ano | findstr :${PORT}`);
          Logger.error(`      Sau đó: taskkill /PID <pid> /F`);
        } else {
          Logger.error(`      Linux/Mac: lsof -ti :${PORT} | xargs kill -9`);
        }
        process.exit(1);
      } else {
        Logger.error(`❌ [Server] Lỗi khi khởi động server:`, error);
        throw error;
      }
    });

    // ✅ Health check endpoint for real-time services
    app.get("/api/realtime/health", async (req: Request, res: Response) => {
      try {
        const { socketService } = await import(
          "./infrastructure/realtime/pusher.service.js"
        );
        res.status(200).json({
          status: "ok",
          pusher: {
            initialized: socketService.pusherInstance !== null,
          },
          changeStreams: "active",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        Logger.error("[Health] Pusher not initialized", error);
        res.status(503).json({
          status: "error",
          message: "Pusher not initialized",
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
console.log("[Server] Calling startServer()...");
const runningServer = startServer().catch((error) => {
  console.error("[Server] ❌ Fatal error in startServer():", error);
  console.error("[Server] Error stack:", error?.stack);
  process.exit(1);
});

export default runningServer; // Export promise chứa server
