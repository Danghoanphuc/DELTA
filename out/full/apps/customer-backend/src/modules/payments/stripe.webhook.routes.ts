// src/modules/payments/stripe.webhook.routes.ts
// ✅ BẢN VÁ: Thêm đuôi .js cho TẤT CẢ imports

import { Router } from "express";
// SỬA LỖI: Import controller từ .js (vì nó là file .ts)
import { StripeWebhookController } from "./stripe.webhook.controller.js";

const router = Router();
const controller = new StripeWebhookController();

// POST /api/webhooks/stripe (Middleware raw body đã ở server.ts)
router.post("/", controller.handleWebhook);

export default router;
