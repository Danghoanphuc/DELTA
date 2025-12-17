// apps/admin-backend/src/routes/admin.document.routes.ts
// ✅ Document Routes - Phase 7.1.4
// API endpoints cho document operations

import { Router } from "express";
import { DocumentController } from "../controllers/admin.document.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new DocumentController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/admin/documents/invoices
 * @desc Get invoices by organization
 * @access Admin
 * Requirements: 10.1
 */
router.get("/invoices", controller.getInvoices);

/**
 * @route GET /api/admin/documents/invoice/:invoiceId
 * @desc Get invoice by ID
 * @access Admin
 * Requirements: 10.1
 */
router.get("/invoice/:invoiceId", controller.getInvoice);

/**
 * @route GET /api/admin/documents/:orderId
 * @desc Get all documents for an order
 * @access Admin
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
router.get("/:orderId", controller.getOrderDocuments);

/**
 * @route POST /api/admin/documents/invoice/:orderId
 * @desc Generate invoice from swag order
 * @access Admin
 * Requirements: 10.1, 10.2
 */
router.post("/invoice/:orderId", controller.generateInvoice);

/**
 * @route POST /api/admin/documents/invoice/:invoiceId/mark-paid
 * @desc Mark invoice as paid
 * @access Admin
 * Requirements: 10.2
 */
router.post("/invoice/:invoiceId/mark-paid", controller.markInvoiceAsPaid);

/**
 * @route POST /api/admin/documents/credit-note/:invoiceId
 * @desc Generate credit note for refund
 * @access Admin
 * Requirements: 10.3
 */
router.post("/credit-note/:invoiceId", controller.generateCreditNote);

/**
 * @route POST /api/admin/documents/delivery-note/:productionOrderId
 * @desc Generate delivery note for supplier
 * @access Admin
 * Requirements: 10.4
 */
router.post(
  "/delivery-note/:productionOrderId",
  controller.generateDeliveryNote
);

/**
 * @route POST /api/admin/documents/packing-slip/:orderId/:recipientId
 * @desc Generate packing slip for recipient
 * @access Admin
 * Requirements: 8.4
 */
router.post(
  "/packing-slip/:orderId/:recipientId",
  controller.generatePackingSlip
);

export default router;
