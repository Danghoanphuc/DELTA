// src/shared/middleware/index.js (✅ UPDATED - NEW MIDDLEWARES)
// Đây là tệp "barrel" để export tất cả các middleware

// Export các middleware xác thực (từ auth.middleware.js)
export {
  protect, // Required authentication
  optionalAuth, // ✨ NEW: Optional authentication (guest + auth)
  isPrinter, // Check if user is a printer
  requireAuth, // ✨ NEW: Require auth with friendly message
} from "./auth.middleware.js";

// Export các middleware xử lý lỗi (từ error-handler.middleware.js)
export { errorHandler, handleUploadError } from "./error-handler.middleware.js";
