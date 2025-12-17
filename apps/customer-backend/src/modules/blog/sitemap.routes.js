// apps/customer-backend/src/modules/blog/sitemap.routes.js
// Routes for sitemap

import express from "express";
import { SitemapController } from "./sitemap.controller.js";

const router = express.Router();
const controller = new SitemapController();

// Public route (no authentication required)
router.get("/sitemap.xml", controller.generateSitemap.bind(controller));

export default router;
