// apps/customer-backend/src/modules/contact-requests/contact-request.routes.js
import { Router } from "express";
import { ContactRequestController } from "./contact-request.controller.js";
import { authenticate, isAdmin } from "../../shared/middleware/index.js";

const router = Router();
const controller = new ContactRequestController();

/**
 * @route   POST /api/contact-requests
 * @desc    Create contact request (public)
 * @access  Public
 */
router.post("/", controller.createContactRequest);

/**
 * @route   GET /api/contact-requests
 * @desc    Get all contact requests (admin only)
 * @access  Admin
 */
router.get("/", authenticate, isAdmin, controller.getContactRequests);

/**
 * @route   GET /api/contact-requests/:id
 * @desc    Get contact request detail (admin only)
 * @access  Admin
 */
router.get("/:id", authenticate, isAdmin, controller.getContactRequest);

/**
 * @route   PUT /api/contact-requests/:id/status
 * @desc    Update contact request status (admin only)
 * @access  Admin
 */
router.put("/:id/status", authenticate, isAdmin, controller.updateStatus);

export default router;
