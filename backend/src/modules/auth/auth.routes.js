// src/modules/auth/auth.routes.js
import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();
const authController = new AuthController();

// Public routes for authentication
// (Các route này được chuyển từ /src/routes/authRoute.js cũ)

router.post("/signup", authController.signUp);
router.post("/signup-printer", authController.signUpPrinter);
router.post("/signin", authController.signIn);
router.post("/signout", authController.signOut);
router.post("/refresh", authController.refresh);
router.post("/verify-email", authController.verifyEmail);

export default router;
