// src/server.js (ĐÃ CẬP NHẬT)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { validateEnv } from "./config/env.config.js";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();
validateEnv();

//======================== Infrastructure =========================
import { connectDB } from "./infrastructure/database/connection.js";
import "./infrastructure/auth/passport.config.js";

//========================= Middleware ==============================
import { errorHandler } from "./shared/middleware/index.js";
import { Logger } from "./shared/utils/index.js";

//========================== Routes ==========================
import authRoutes from "./modules/auth/auth.routes.js";
import authOAuthRoutes from "./modules/auth/auth-oauth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import printerRoutes from "./modules/printers/printer.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import { productRoutes } from "./modules/products/index.js";
import designRoutes from "./modules/designs/design.routes.js";
import studioRoutes from "./modules/printer-studio/studio.routes.js";
import pdfRenderRoutes from "./modules/printer-studio/pdf-render/pdf-render.routes.js";
import assetRoutes from "./modules/assets/asset.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";
// ✅ BƯỚC 1: IMPORT MODULE MEDIA-ASSETS
import mediaAssetRoutes from "./modules/media-assets/media-asset.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// ==================== CORS Configuration =======================
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://www.printz.vn",
    ];

    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// ================= Body parsing middleware ====================
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//==================== Session configuration ===================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

//================ Passport initialization ==========================
app.use(passport.initialize());
app.use(passport.session());

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    Logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

//============================ Health check ======================
app.get("/", (req, res) => {
  res.json({
    message: "PrintZ API v2.0 - Clean Architecture",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//==================== API Routes ===============================
app.use("/api/auth", authRoutes);
app.use("/api/auth", authOAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/printer-studio", studioRoutes);
app.use("/api/pdf-render", pdfRenderRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/uploads", uploadRoutes);
// ✅ BƯỚC 2: ĐĂNG KÝ ROUTE VÀO EXPRESS
app.use("/api/media-assets", mediaAssetRoutes);

//==================== 404 handler ==================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

//========================== Global error handler (MUST BE LAST)
app.use(errorHandler);

//============================== Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      Logger.success(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV || "development",
        port: PORT,
      });
    });
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
