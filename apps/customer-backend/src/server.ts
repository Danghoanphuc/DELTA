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
    Logger.info("✅ Đã kết nối Database & Redis thành công.");

    try {
      const { urlPreviewQueue } = await import("./infrastructure/queue/url-preview.queue.js");
      const { urlProcessorWorker } = await import("./modules/chat/workers/url-processor.worker.js");

      if (!urlProcessorWorker) {
        throw new Error("urlProcessorWorker is undefined");
      }

      // ✅ CRITICAL: Worker wrapper với complete domain isolation
      const safeProcessJob = async (job: any) => {
        const jobId = job.id;
        const jobData = job.data;
        const jobStartTime = Date.now();
        
        // ✅ CRITICAL: Heartbeat để track job progress
        const heartbeatInterval = setInterval(() => {
          const elapsed = ((Date.now() - jobStartTime) / 1000).toFixed(1);
          Logger.info(`[URL Preview Worker] 💓 Job ${jobId} đang chạy... (${elapsed}s)`);
        }, 10000);

        try {
          Logger.info(`[URL Preview Worker] 📋 Processing job ${jobId}`);
          Logger.info(`[URL Preview Worker] Job data:`, JSON.stringify(jobData, null, 2));
          
          // ✅ CRITICAL: Wrap trong Promise với comprehensive error handling
          const result = await new Promise(async (resolve, reject) => {
            // ✅ Inner timeout để đảm bảo không bao giờ hang
            const timeout = setTimeout(() => {
              Logger.error(`[URL Preview Worker] ⏱️ Internal timeout cho job ${jobId} sau 42s`);
              reject(new Error(`Worker internal timeout for job ${jobId}`));
            }, 42000); // 42s (dưới job timeout 45s)

            try {
              Logger.info(`[URL Preview Worker] 🔄 Gọi urlProcessorWorker.processUrlJob cho job ${jobId}...`);
              const processResult = await urlProcessorWorker.processUrlJob(job);
              clearTimeout(timeout);
              Logger.info(`[URL Preview Worker] ✅ processUrlJob hoàn thành cho job ${jobId}`);
              resolve(processResult);
            } catch (processError: any) {
              clearTimeout(timeout);
              Logger.error(`[URL Preview Worker] ❌ processUrlJob failed cho job ${jobId}:`, {
                message: processError?.message || 'Unknown error',
                name: processError?.name || 'Unknown',
                stack: processError?.stack || 'No stack'
              });
              reject(processError);
            }
          });

          clearInterval(heartbeatInterval);
          const duration = ((Date.now() - jobStartTime) / 1000).toFixed(2);
          Logger.info(`[URL Preview Worker] ✅ Job ${jobId} completed trong ${duration}s`);
          return result;
          
        } catch (workerError: any) {
          clearInterval(heartbeatInterval);
          const duration = ((Date.now() - jobStartTime) / 1000).toFixed(2);
          
          // ✅ CRITICAL: Log đầy đủ nhưng KHÔNG crash server
          Logger.error(`[URL Preview Worker] ❌ Error in job ${jobId} sau ${duration}s:`, {
            message: workerError?.message || 'Unknown error',
            name: workerError?.name || 'Unknown',
            code: workerError?.code || 'N/A',
            stack: workerError?.stack || 'No stack',
            jobData: jobData
          });
          
          // ✅ CRITICAL: Đảm bảo error được log trước khi throw
          console.error(`[URL Preview Worker] CRITICAL ERROR in job ${jobId}:`, workerError);
          
          // ✅ Re-throw để Bull đánh dấu failed (sẽ retry)
          throw workerError;
        }
      };

      // ✅ Register worker với concurrency 1
      urlPreviewQueue.process(1, safeProcessJob);
      
      Logger.info("✅ URL Preview Worker đã sẵn sàng (concurrency: 1)");

    } catch (queueError) {
      Logger.error("❌ Lỗi khi khởi chạy URL Preview Worker:", queueError);
      Logger.error("Stack:", queueError instanceof Error ? queueError.stack : 'No stack');
      Logger.warn("⚠️ Server sẽ tiếp tục khởi động nhưng URL Preview sẽ không hoạt động");
    }

    // ✅ CRITICAL: Global error handlers (nằm NGOÀI try-catch trên)
    // Đặt sau worker registration để bắt mọi unhandled errors
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error(`[Process] ⚠️ Unhandled Rejection:`, {
        reason: reason,
        promise: promise
      });
      // ✅ KHÔNG exit - chỉ log
    });

    process.on('uncaughtException', (error) => {
      Logger.error(`[Process] ⚠️ Uncaught Exception:`, {
        message: error.message,
        stack: error.stack
      });
      // ✅ KHÔNG exit - chỉ log
    });

    // ✅ IMPORT QUEUES & WORKERS (sau khi Redis đã kết nối)
    // Import queue.config.js để có Bull Board UI và PDF Queue
    try {
      await import('./config/queue.config.js');
      Logger.info("✅ Đã khởi chạy Queue Workers (PDF Renderer, URL Preview).");
    } catch (queueConfigError) {
      Logger.error("❌ Lỗi khi import queue.config.js:", queueConfigError);
      // ✅ Không throw để server vẫn có thể chạy
    }

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
    // Khai báo các biến routes ở ngoài để có thể sử dụng sau
    let authRoutes, oauthRoutes, userRoutes, connectionRoutes, printerRoutes;
    let productRoutes, assetRoutes, mediaAssetRoutes, designRoutes;
    let cartRoutes, orderRoutes, studioRoutes, pdfRenderRoutes;
    let chatRoutes, uploadRoutes, customerRoutes, checkoutRoutes;
    let stripeOnboardingRoutes, stripeWebhookRoutes, momoRoutes, payosRoutes;
    let notificationRoutes, aiRoutes, walletRoutes, rushRoutes, printerDashboardRoutes;
    
    try {
      authRoutes = (await import("./modules/auth/auth.routes.js")).default;
      oauthRoutes = (await import("./modules/auth/auth-oauth.routes.js")).default;
      userRoutes = (await import("./modules/users/user.routes.js")).default;
      connectionRoutes = (await import("./modules/connections/connection.routes.js")).default;
      printerRoutes = (await import("./modules/printers/printer.routes.js")).default;
      productRoutes = (await import("./modules/products/product.routes.js")).default;
      assetRoutes = (await import("./modules/assets/asset.routes.js")).default;
      mediaAssetRoutes = (await import("./modules/media-assets/media-asset.routes.js")).default;
      designRoutes = (await import("./modules/designs/design.routes.js")).default;
      cartRoutes = (await import("./modules/cart/cart.routes.js")).default;
      orderRoutes = (await import("./modules/orders/order.routes.js")).default;
      studioRoutes = (await import("./modules/printer-studio/studio.routes.js")).default;
      pdfRenderRoutes = (await import("./modules/printer-studio/pdf-render/pdf-render.routes.js")).default;
      chatRoutes = (await import("./modules/chat/chat.routes.js")).default;
      uploadRoutes = (await import("./modules/uploads/upload.routes.js")).default;
      customerRoutes = (await import("./modules/customer/customer.routes.js")).default;
      checkoutRoutes = (await import("./modules/checkout/checkout.routes.js")).default;
      stripeOnboardingRoutes = (await import("./modules/payments/stripe.onboarding.routes.js")).default;
      stripeWebhookRoutes = (await import("./modules/payments/stripe.webhook.routes.js")).default;
      momoRoutes = (await import("./modules/payments/momo/momo.routes.js")).default;
      payosRoutes = (await import("./modules/payments/payos/payos.routes.js")).default;
      notificationRoutes = (await import("./modules/notifications/notification.routes.js")).default;
      aiRoutes = (await import("./modules/ai/ai.routes.js")).default;
      walletRoutes = (await import("./modules/wallet/wallet.routes.js")).default;
      rushRoutes = (await import("./modules/rush/rush.routes.js")).default;
      printerDashboardRoutes = (await import("./modules/printer-studio/printer-dashboard.routes.js")).default;
    } catch (routeError) {
      Logger.error("❌ Lỗi khi import routes:", routeError);
      Logger.error("Stack trace:", routeError instanceof Error ? routeError.stack : "No stack trace");
      throw routeError; // Re-throw để catch block bên ngoài xử lý
    }

    // --- 3. KHỞI TẠO APP VÀ MIDDLEWARE ---
    const app = express();
    const server = http.createServer(app);

    // ✅ Tăng timeout cho upload ảnh (3 phút)
    server.timeout = 180000; // 3 minutes = 180,000ms
    server.keepAliveTimeout = 185000; // Slightly higher than timeout
    server.headersTimeout = 186000; // Slightly higher than keepAliveTimeout

    app.set("trust proxy", 1);

    // ---------------------------------------------------------
    // 1. LOGGER MIDDLEWARE (Đặt ngay đầu tiên)
    // Giúp bạn thấy ngay lập tức khi có request bay vào
    // ---------------------------------------------------------
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`👉 [REQUEST] ${req.method} ${req.url}`);
      Logger.info(`[REQUEST] ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });
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
    
    // ✅ FIX: Tách route test ra ngoài để không bị chặn bởi protect middleware
    // Route test không cần authentication
    apiRouter.get("/chat/test", (req: Request, res: Response) => {
      Logger.info("[ChatRoutes] Test route called");
      res.json({ success: true, message: "Chat routes are working" });
    });
    
    // Các route chat khác vẫn cần protect
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
    // ✅ RUSH ORDER: Rush order routes
    apiRouter.use("/rush", rushRoutes);

    app.use("/api", apiRouter);

    // ✅ QUEUE MONITORING: Bull Board UI (Admin only - có thể thêm protect middleware sau)
    try {
      const { bullBoardRouter } = await import('./config/queue.config.js');
      app.use("/admin/queues", bullBoardRouter);
      Logger.info("✅ Bull Board UI available at /admin/queues");
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

    // Initialize MongoDB Change Streams
    initChangeStreams();

    // ✅ MAINTENANCE: Initialize Cron Jobs
    initCronJobs();

    // --- 8. LẮNG NGHE ---
    const PORT: number = parseInt(process.env.PORT || "8000", 10);
    // ✅ FIX: Listen trên 0.0.0.0 để tránh vấn đề IPv6 trên Windows
    // 0.0.0.0 sẽ lắng nghe trên cả IPv4 và IPv6
    server.listen(PORT, "0.0.0.0", () => {
      Logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      Logger.info(`🚀 Server đang chạy tại http://127.0.0.1:${PORT}`);
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
