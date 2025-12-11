// backend/src/shared/middleware/index.js
// ✅ UPDATED: Added 'isAdmin' to the export list

// ==================== Authentication Middlewares ====================
export {
  protect, // Required authentication
  authenticate, // Alias for protect (backward compatibility)
  optionalAuth, // Optional authentication (guest + auth)
  isPrinter, // Check if user is a printer
  isOrganization, // ✅ NEW: Check if user is an organization (B2B)
  isAdmin, // Check if user is admin
  requireAuth, // Require auth with friendly message
  isVerified, // Check if user email is verified
} from "./auth.middleware.js";

// ==================== Organization Member Middlewares ====================
export {
  requireOrgMembership, // Check if user is member of organization
  requireOrgRole, // Check if user has specific role
  requireOwner, // Require owner role
  requireAdminOrOwner, // Require admin or owner role
  requirePermission, // Check custom permission
} from "./organization-member.middleware.js";

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
