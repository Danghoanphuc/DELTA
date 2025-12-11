// apps/customer-backend/src/modules/order-thread/order-thread.routes.js
/**
 * Order Thread Routes (Customer side)
 */

import express from "express";
import { OrderThreadController } from "./order-thread.controller.js";
import { authenticate } from "../../shared/middleware/index.js";

const router = express.Router();
const controller = new OrderThreadController();

// All routes require authentication
router.use(authenticate);

// Get or create thread by order ID
router.get("/:orderId", controller.getThreadByOrder.bind(controller));

// Add message to thread
router.post("/:threadId/messages", controller.addMessage.bind(controller));

export default router;
