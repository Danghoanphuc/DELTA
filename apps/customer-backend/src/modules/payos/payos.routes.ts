import express from "express";
import { createPaymentLink, handlePayOSWebhook } from "./payos.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-payment", protect, createPaymentLink); // ✅ Thêm protect middleware
router.post("/webhook", handlePayOSWebhook); // Webhook không cần auth

export default router;
