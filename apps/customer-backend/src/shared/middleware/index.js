// backend/src/shared/middleware/index.js
// ✅ UPDATED: Added 'isAdmin' to the export list

// ==================== Authentication Middlewares ====================
export {
  protect, // Required authentication
  optionalAuth, // Optional authentication (guest + auth)
  isPrinter, // Check if user is a printer
  isOrganization, // ✅ NEW: Check if user is an organization (B2B)
  isAdmin, // Check if user is admin
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
