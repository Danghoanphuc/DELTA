// src/shared/middleware/index.js
// Đây là tệp "barrel" để export tất cả các middleware

// Export các middleware xác thực (từ auth.middleware.js)
export { protect, isPrinter } from "./auth.middleware.js";

// Export các middleware xử lý lỗi (từ error-handler.middleware.js)
export { errorHandler, handleUploadError } from "./error-handler.middleware.js";
