/**
 * Job Ticket Routes
 *
 * API endpoints for job ticket operations
 * Requirements: 6.1, 6.3, 6.5
 */

import { Router } from "express";
import { JobTicketController } from "../controllers/admin.job-ticket.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new JobTicketController();

// All routes require authentication
router.use(authenticate);

// Job ticket management
router.post("/orders/:orderId/job-ticket", controller.generateJobTicket);
router.get("/orders/:orderId/job-tickets", controller.getJobTicketsByOrder);
router.get("/job-tickets/active", controller.getActiveTickets);
router.get("/job-tickets/qr/:code", controller.resolveQRCode);
router.get("/job-tickets/:id", controller.getJobTicket);
router.put("/job-tickets/:id/status", controller.updateStatus);
router.post("/job-tickets/:id/complete", controller.markCompleted);
router.post("/job-tickets/:id/logs", controller.addProductionLog);
router.post("/job-tickets/:id/errors", controller.logProductionError);

export default router;
