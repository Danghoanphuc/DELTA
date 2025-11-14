// apps/admin-backend/src/server.ts
import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

// --- Import các file chúng ta vừa tạo ---
import adminAuthRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.handler.middleware.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminPrinterRoutes from "./routes/admin.printer.routes.js";
import tierRuleRoutes from "./routes/tier-rule.routes.js";
import { initializeCronJobs } from "./workers/index.js";
import adminProductRoutes from "./routes/admin.product.routes.js";
import adminManagementRoutes from "./routes/admin.management.routes.js";
import adminAuditLogRoutes from "./routes/admin.audit-log.routes.js";
const app = express();
const PORT = process.env.PORT || process.env.ADMIN_API_PORT || 5002;

// --- Cấu hình Middleware cơ bản ---
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Kết nối MongoDB (Sử dụng key của Phúc) ---
const MONGO_URI = process.env.MONGODB_CONNECTIONSTRING;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGODB_CONNECTIONSTRING is not defined.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ (Admin) Connected to MongoDB.");
    initializeCronJobs();
  })
  .catch((err) => {
    console.error("❌ (Admin) MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes (ĐÃ KÍCH HOẠT) ---
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/printers", adminPrinterRoutes);
app.use("/api/admin/tier-rules", tierRuleRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/admins", adminManagementRoutes);
app.use("/api/admin/audit-logs", adminAuditLogRoutes);

// --- Error Handler (ĐÃ KÍCH HOẠT) ---
app.use(errorHandler);

// --- Khởi động Server ---
app.listen(PORT, () => {
  console.log(`🚀 Admin API Server listening on http://localhost:${PORT}`);
});
