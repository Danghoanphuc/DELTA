// src/modules/users/user.routes.js
import { Router } from "express";
import { UserController } from "./user.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users/me
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get("/me", protect, userController.getMe);

export default router;
