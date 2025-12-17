// src/routes/webhook.routes.ts
// ✅ Webhook Routes - Public endpoints cho carrier webhooks

import { Router } from "express";
import { shippingController } from "../controllers/admin.shipping.controller.js";

const router = Router();

/**
 * @route   POST /api/webhooks/carriers/:carrier
 * @desc    Handle carrier webhook (GHN, Viettel Post, GHTK, etc.)
 * @access  Public (no auth - carrier webhook)
 */
router.post("/carriers/:carrier", shippingController.handleWebhook);

export default router;
