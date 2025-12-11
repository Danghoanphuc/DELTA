// apps/admin-backend/src/routes/admin.order-thread.routes.ts
/**
 * Admin Order Thread Routes
 */

import { Router } from "express";
import { AdminOrderThreadController } from "../controllers/admin.order-thread.controller.js";
import { isAuthenticatedAdmin } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new AdminOrderThreadController();

// All routes require admin authentication
router.use(isAuthenticatedAdmin);

// Get or create thread by order ID
router.get("/:orderId", controller.getThreadByOrder.bind(controller));

// Add message to thread
router.post("/:threadId/messages", controller.addMessage.bind(controller));

export default router;
