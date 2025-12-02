// apps/customer-backend/src/modules/webhooks/momo.webhook.routes.js
import { Router } from "express";
import { MomoWebhookController } from "./momo.webhook.controller.js";
import { Logger } from "../../shared/utils/index.js";

const router = Router();
const controller = new MomoWebhookController();

Logger.info("🔀[Webhooks] Đăng ký routes cho MoMo...");

// MoMo IPN (JSON body)
router.post("/ipn", controller.handleMomoIPN);

// MoMo Return (redirect)
router.get("/return", controller.handleMomoReturn);

export default router;


