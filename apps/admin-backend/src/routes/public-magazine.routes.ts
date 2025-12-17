// Public routes for magazine (no authentication required)
import { Router } from "express";
import { PublicMagazineController } from "../controllers/public-magazine.controller.js";

const router = Router();
const controller = new PublicMagazineController();

// Public routes - no authentication
// GET /magazine - all posts
router.get("/", controller.getAllPosts);

// GET /magazine/posts/:id - post detail by slug or ID (must be before /:category)
router.get("/posts/:id", controller.getPostById);

// GET /magazine/:category - posts by category (e.g., /magazine/triet-ly-song)
// This must be AFTER /posts/:id to avoid conflict
router.get("/:category", controller.getPostsByCategory);

export default router;
