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

// --- COD confirm order ---
router.post("/cod/confirm", checkoutController.confirmCodOrder);

// --- ✅ NEW: Unified process checkout endpoint ---
router.post("/process", checkoutController.processCheckout);

export default router;
