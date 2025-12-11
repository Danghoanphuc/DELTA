// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.routes.js

import { Router } from "express";
import multer from "multer";
import { DeliveryCheckinController } from "./delivery-checkin.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import {
  isShipper,
  isCustomer,
  isShipperOrCustomer,
  verifyShipperOwnership,
  verifyCustomerOwnership,
} from "./delivery-checkin.middleware.js";
import {
  enforceHTTPS,
  addSecurityHeaders,
  sanitizeGPSInResponse,
} from "./security.middleware.js";
import {
  responseTimeMiddleware,
  cacheControlMiddleware,
  paginationMiddleware,
  boundsValidationMiddleware,
} from "./performance.middleware.js";

const router = Router();
const controller = new DeliveryCheckinController();

// Configure multer for memory storage (photos will be processed by PhotoUploadService)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file before compression
    files: 10, // Max 10 photos per check-in
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files (JPEG, PNG, WebP)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP"),
        false
      );
    }
  },
});

// Apply security controls to all routes
// **Validates: Requirements 13.1** - HTTPS enforcement in production
router.use(enforceHTTPS);
router.use(addSecurityHeaders);

// Apply performance monitoring middleware
// **Validates: Requirements 12.1, 12.5** - API response time optimization
router.use(responseTimeMiddleware);
router.use(paginationMiddleware);

// All routes require authentication
// **Validates: Requirements 13.2** - Photo access control for authenticated users only
router.use(authenticate);

// Apply GPS coordinate privacy sanitization to responses
// **Validates: Requirements 13.3** - GPS coordinate privacy for unauthorized users
router.use(sanitizeGPSInResponse);

// ==================== Map/Bounds Query (must be before /:id) ====================
/**
 * @route GET /api/delivery-checkins/map/bounds
 * @desc Get check-ins within geographic bounds for map view
 * @access Authenticated users
 * @query minLng, minLat, maxLng, maxLat - Geographic bounds
 * @query customerId - Optional filter by customer
 *
 * **Validates: Requirements 7.6, 12.3** - Geospatial bounds query with caching
 */
router.get(
  "/map/bounds",
  boundsValidationMiddleware,
  cacheControlMiddleware({ maxAge: 60 }), // 1 minute cache
  controller.getCheckinsByBounds
);

// ==================== Order-specific routes (must be before /:id) ====================
/**
 * @route GET /api/delivery-checkins/order/:orderId
 * @desc Get all check-ins for a specific order
 * @access Shipper (assigned to order) or Customer (owns order)
 */
router.get(
  "/order/:orderId",
  isShipperOrCustomer,
  controller.getCheckinsByOrder
);

// ==================== Shipper-specific routes ====================
/**
 * @route GET /api/delivery-checkins/shipper
 * @desc Get current shipper's check-in history (uses token)
 * @access Shipper only
 */
router.get("/shipper", isShipper, controller.getMyShipperHistory);

/**
 * @route GET /api/delivery-checkins/assigned-orders
 * @desc Get shipper's assigned orders for check-in
 * @access Shipper only
 */
router.get("/assigned-orders", isShipper, controller.getAssignedOrders);

/**
 * @route GET /api/delivery-checkins/shipper/:shipperId
 * @desc Get shipper's check-in history
 * @access Shipper (own data only) or Admin
 */
router.get(
  "/shipper/:shipperId",
  isShipper,
  verifyShipperOwnership("shipperId"),
  controller.getShipperHistory
);

// ==================== Customer-specific routes ====================
/**
 * @route GET /api/delivery-checkins/customer
 * @desc Get current customer's check-ins for map view (uses token)
 * @access Customer only
 */
router.get("/customer", isCustomer, controller.getMyCustomerCheckins);

/**
 * @route GET /api/delivery-checkins/customer/:customerId
 * @desc Get customer's check-ins for map view
 * @access Customer (own data only) or Admin
 */
router.get(
  "/customer/:customerId",
  isCustomer,
  verifyCustomerOwnership("customerId"),
  controller.getCustomerCheckins
);

// ==================== CRUD Operations ====================

/**
 * @route POST /api/delivery-checkins
 * @desc Create a new delivery check-in with photos
 * @access Shipper only
 * @body orderId, orderNumber, customerId, customerEmail, location, address, gpsMetadata, notes
 * @files photos[] - Multiple photo files (JPEG, PNG, WebP)
 */
router.post(
  "/",
  isShipper,
  upload.array("photos", 10),
  controller.createCheckin
);

/**
 * @route GET /api/delivery-checkins
 * @desc Get all check-ins for current user (shipper or customer)
 * @access Authenticated users
 * @query status, page, limit, startDate, endDate
 */
router.get("/", controller.getCheckins);

/**
 * @route GET /api/delivery-checkins/:id
 * @desc Get check-in by ID
 * @access Shipper (owner), Customer (order owner), or Admin
 */
router.get("/:id", controller.getCheckin);

/**
 * @route DELETE /api/delivery-checkins/:id
 * @desc Delete check-in (soft delete)
 * @access Shipper only (owner of check-in)
 */
router.delete("/:id", isShipper, controller.deleteCheckin);

/**
 * @route POST /api/delivery-checkins/:id/photos/retry
 * @desc Retry photo upload for a specific check-in
 * @access Shipper only (owner of check-in)
 * @files photos[] - Photo files to upload
 */
router.post(
  "/:id/photos/retry",
  isShipper,
  upload.array("photos", 10),
  controller.retryPhotoUpload
);

export default router;
