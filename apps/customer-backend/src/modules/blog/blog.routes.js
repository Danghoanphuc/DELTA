// apps/customer-backend/src/modules/blog/blog.routes.js
// Routes for public blog posts

import express from "express";
import { BlogController } from "./blog.controller.js";

const router = express.Router();
const controller = new BlogController();

// Public routes (no authentication required)
router.get("/posts", controller.getPosts.bind(controller));
router.get("/posts/:id", controller.getPostById.bind(controller));
router.post("/posts/:id/like", controller.likePost.bind(controller));

export default router;
