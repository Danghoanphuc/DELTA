// apps/admin-backend/src/routes/admin-auth.routes.ts
// ✅ STANDARDIZED: Admin auth routes using shared auth package

import { Router } from "express";
import { AdminAuthController } from "../controllers/admin-auth.controller.js";

const router = Router();
const adminAuthController = new AdminAuthController();

// TODO: Implement proper rate limiting and auth middleware when @delta/auth is configured

// ✅ PUBLIC ROUTES: Authentication endpoints
router.post("/signin", adminAuthController.signIn);
router.post("/signout", adminAuthController.signOut);
router.post("/refresh", adminAuthController.refresh);

// ✅ PROTECTED ROUTES: Require authentication (temporarily disabled)
router.get("/me", adminAuthController.getMe);
router.get("/sessions", adminAuthController.getActiveSessions);
router.delete("/sessions/:sessionId", adminAuthController.revokeSession);

export default router;
