// src/modules/checkout/checkout.routes.js
import { Router } from "express";
import { CheckoutController } from "./checkout.controller.js";
import {
  protect,
  ensureCustomerProfile,
} from "../../shared/middleware/index.js";

const router = Router();
const checkoutController = new CheckoutController();

// Áp dụng middleware bảo vệ và đảm bảo là Customer
router.use(protect, ensureCustomerProfile);

// Endpoint (GĐ 5.4)
router.post(
  "/stripe/create-payment-intent",
  checkoutController.createStripePaymentIntent
);

// --- ENDPOINT MỚI (GĐ 5.R2) ---
router.post("/vnpay/create-payment-url", checkoutController.createVnPayUrl);

export default router;
