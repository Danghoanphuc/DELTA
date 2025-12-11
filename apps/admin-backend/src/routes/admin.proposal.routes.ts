/**
 * Proposal Routes
 *
 * API endpoints for proposal management
 * Requirements: 2.1, 2.2, 2.5
 */

import { Router } from "express";
import { proposalController } from "../controllers/admin.proposal.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/proposals
 * @desc Create new proposal
 * @access Private
 */
router.post("/", proposalController.createProposal);

/**
 * @route GET /api/proposals/:id
 * @desc Get proposal details
 * @access Private
 */
router.get("/:id", proposalController.getProposal);

/**
 * @route GET /api/proposals/customer/:customerId
 * @desc Get proposals by customer
 * @access Private
 */
router.get("/customer/:customerId", proposalController.getProposalsByCustomer);

/**
 * @route GET /api/proposals/:id/pdf
 * @desc Download proposal as PDF
 * @access Private
 */
router.get("/:id/pdf", proposalController.downloadPDF);

/**
 * @route GET /api/proposals/:id/text
 * @desc Get text summary for messaging
 * @access Private
 */
router.get("/:id/text", proposalController.getTextSummary);

/**
 * @route POST /api/proposals/:id/convert
 * @desc Convert proposal to order
 * @access Private
 */
router.post("/:id/convert", proposalController.convertToOrder);

/**
 * @route PUT /api/proposals/:id/status
 * @desc Update proposal status
 * @access Private
 */
router.put("/:id/status", proposalController.updateStatus);

export default router;
