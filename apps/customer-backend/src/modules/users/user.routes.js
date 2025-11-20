// apps/customer-backend/src/modules/users/user.routes.js
import { Router } from "express";
import { UserController } from "./user.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const userController = new UserController();

// ⚠️ IMPORTANT: Specific routes must come BEFORE dynamic params
// Get current logged-in user
router.get("/me", protect, userController.getCurrentUser.bind(userController));

// ✅ SOCIAL: Search users
router.get("/search", protect, userController.searchUsers.bind(userController));

// ✅ SOCIAL: Get user profile by ID
router.get("/:userId", protect, userController.getUserProfile.bind(userController));

export default router;
