// src/modules/recipients/recipient.routes.js
// ✅ Recipient Routes - API endpoints

import { Router } from "express";
import { RecipientController } from "./recipient.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";
import multer from "multer";

const router = Router();
const recipientController = new RecipientController();

// Multer config for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file CSV"));
    }
  },
});

// All routes require authentication + organization
router.use(protect, isOrganization);

/**
 * @route   GET /api/recipients/template
 * @desc    Download CSV template
 */
router.get("/template", recipientController.downloadTemplate);

/**
 * @route   GET /api/recipients/filters
 * @desc    Get filter options (tags, departments)
 */
router.get("/filters", recipientController.getFilterOptions);

/**
 * @route   POST /api/recipients/import
 * @desc    Import recipients from CSV
 */
router.post("/import", upload.single("file"), recipientController.importCSV);

/**
 * @route   POST /api/recipients/bulk-archive
 * @desc    Bulk archive recipients
 */
router.post("/bulk-archive", recipientController.bulkArchive);

/**
 * @route   POST /api/recipients/add-tags
 * @desc    Add tags to multiple recipients
 */
router.post("/add-tags", recipientController.addTags);

/**
 * @route   GET /api/recipients
 * @desc    Get recipients list with filters
 */
router.get("/", recipientController.getRecipients);

/**
 * @route   POST /api/recipients
 * @desc    Create a single recipient
 */
router.post("/", recipientController.createRecipient);

/**
 * @route   GET /api/recipients/:id
 * @desc    Get single recipient
 */
router.get("/:id", recipientController.getRecipient);

/**
 * @route   PUT /api/recipients/:id
 * @desc    Update recipient
 */
router.put("/:id", recipientController.updateRecipient);

/**
 * @route   DELETE /api/recipients/:id
 * @desc    Archive recipient (soft delete)
 */
router.delete("/:id", recipientController.archiveRecipient);

export default router;
