// apps/customer-backend/src/modules/payments/momo/momo.routes.js
import { Router } from "express";
import { MomoController } from "./momo.controller.js";
import { Logger } from "../../../shared/utils/index.js";

const router = Router();
const controller = new MomoController();

Logger.info("🔀[Payments] Đăng ký routes cho MoMo...");

// MoMo IPN (JSON body)
router.post("/ipn", controller.handleMomoIPN);

// MoMo Return (redirect)
router.get("/return", controller.handleMomoReturn);

export default router;

