// apps/customer-backend/src/modules/delivery-thread/delivery-thread.routes.js
/**
 * Delivery Thread Routes
 */

import { Router } from "express";
import { DeliveryThreadController } from "./delivery-thread.controller.js";
import { authenticate } from "../../shared/middleware/index.js";

const router = Router();
const controller = new DeliveryThreadController();

// All routes require authentication
router.use(authenticate);

// Thread management
router.get("/", controller.getThreads);
router.get("/unread-count", controller.getUnreadCount);
router.get("/checkin/:checkinId", controller.getThreadByCheckin);
router.get("/:threadId", controller.getThread);

// Message management
router.post("/:threadId/messages", controller.addMessage);
router.put("/:threadId/messages/:messageId", controller.updateMessage);
router.delete("/:threadId/messages/:messageId", controller.deleteMessage);

// Thread actions
router.post("/:threadId/read", controller.markAsRead);

export default router;
