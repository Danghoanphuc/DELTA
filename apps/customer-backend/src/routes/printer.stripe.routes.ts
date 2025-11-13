// src/routes/printer.stripe.routes.ts
// ✅ BẢN VÁ: Thêm đuôi .js cho TẤT CẢ imports

import { Router } from "express";
// SỬA LỖI: Import controller từ .js (vì nó là file .ts)
import { StripeOnboardingController } from "../controllers/stripe.onboarding.controller.js";
// (Middleware là file .js)
import { protect, isPrinter } from "../shared/middleware/index.js";

const router = Router();
const controller = new StripeOnboardingController();

// (Middleware đã được áp dụng ở server.ts)

// POST /api/printer-stripe/create-account-link
router.post("/create-account-link", controller.createAccountLink);

// GET /api/printer-stripe/onboarding-return (Stripe redirect về đây)
router.get("/onboarding-return", controller.handleOnboardingReturn);

export default router;
