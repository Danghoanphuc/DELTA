// apps/customer-backend/src/modules/webhooks/vnpay.webhook.routes.js
import { Router } from "express";
import { VnPayWebhookController } from "./vnpay.webhook.controller.js";

// ✅ ĐÃ BỔ SUNG IMPORT CÒN THIẾU
import { Logger } from "../../shared/utils/index.js";

const router = Router();
const controller = new VnPayWebhookController();

Logger.info("🔀[Webhooks] Đăng ký routes cho VNPay..."); // Dòng này giờ đã hợp lệ

// Endpoint VNPay IPN (backend-to-backend)
router.get("/ipn", controller.handleVnPayIPN);

// Endpoint VNPay Return (khách hàng quay về)
// (Tạm thời, GĐ 5.R3 sẽ xử lý ở Frontend)
router.get("/return", controller.handleVnPayReturn);

export default router;
