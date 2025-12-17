// apps/admin-backend/src/routes/public-artisan.routes.ts
// Public routes for artisan/supplier profiles (no authentication required)

import { Router } from "express";
import { PublicArtisanController } from "../controllers/public-artisan.controller.js";

const router = Router();
const controller = new PublicArtisanController();

// Public routes - no authentication
router.get("/", controller.getArtisans);
router.get("/:code", controller.getArtisanByCode);
router.get("/:code/posts", controller.getArtisanPosts);
router.get("/:code/products", controller.getArtisanProducts);

export default router;
