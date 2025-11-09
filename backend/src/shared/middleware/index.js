// backend/src/shared/middleware/index.js
// ✅ UPDATED: Added ensureCustomerProfile and isVerified exports

// ==================== Authentication Middlewares ====================
export {
  protect, // Required authentication
  optionalAuth, // Optional authentication (guest + auth)
  isPrinter, // Check if user is a printer
  requireAuth, // Require auth with friendly message
  isVerified, // Check if user email is verified
} from "./auth.middleware.js";

// ==================== Error Handlers ====================
export {
  errorHandler, // Global error handler
  handleUploadError, // Multer upload error handler
} from "./error-handler.middleware.js";

// ==================== Profile Management ====================
export {
  ensureCustomerProfile, // Auto-create CustomerProfile for legacy users
} from "./ensure-customer-profile.middleware.js";

// ==================== Form Data Parsing ====================
export {
  parseJsonFields, // Parse JSON fields from form-data
} from "./parse-form-data.middleware.js";
