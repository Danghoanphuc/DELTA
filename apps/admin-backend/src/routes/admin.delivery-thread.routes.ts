// apps/admin-backend/src/routes/admin.delivery-thread.routes.ts
/**
 * Admin Delivery Thread Routes
 */

import { Router } from "express";
import { AdminDeliveryThreadController } from "../controllers/admin.delivery-thread.controller";
import { isAuthenticatedAdmin } from "../middleware/admin.auth.middleware";

const router = Router();
const controller = new AdminDeliveryThreadController();

// All routes require admin authentication
router.use(isAuthenticatedAdmin);

// Get thread by checkin ID
router.get("/checkin/:checkinId", (req, res, next) =>
  controller.getThreadByCheckin(req, res, next)
);

// Add message to thread
router.post("/:threadId/messages", (req, res, next) =>
  controller.addMessage(req, res, next)
);

export default router;
