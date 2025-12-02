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

// --- MoMo create payment URL ---
router.post("/momo/create-payment-url", checkoutController.createMomoUrl);

// --- COD confirm order ---
router.post("/cod/confirm", checkoutController.confirmCodOrder);

// --- ✅ NEW: Unified process checkout endpoint ---
router.post("/process", checkoutController.processCheckout);

export default router;
