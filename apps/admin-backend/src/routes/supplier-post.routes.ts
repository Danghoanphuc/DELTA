// apps/admin-backend/src/routes/supplier-post.routes.ts
// Routes for supplier posts

import { Router } from "express";
import { SupplierPostController } from "../controllers/supplier-post.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new SupplierPostController();

// Apply authentication to all routes
router.use(authenticate);

// Get all posts (for related posts picker)
router.get("/", controller.getAllPosts);

// Post CRUD operations
router.get("/:id", controller.getPostById);
router.put("/:id", controller.updatePost);
router.delete("/:id", controller.deletePost);
router.post("/:id/like", controller.toggleLike);

export default router;
