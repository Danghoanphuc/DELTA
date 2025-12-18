// apps/customer-backend/src/modules/catalog/public-catalog.routes.js
// ✅ Public routes for catalog products (no authentication required)
// Used by customer-frontend to display products

import { Router } from "express";
import { PublicCatalogController } from "./public-catalog.controller.js";

const router = Router();
const controller = new PublicCatalogController();

// Public routes - no authentication required

// Products
router.get("/products", controller.getProducts);
router.get("/products/featured", controller.getFeaturedProducts);
router.get("/products/:idOrSlug", controller.getProductById);

// Categories
router.get("/categories", controller.getCategories);
router.get("/categories/:slug/products", controller.getProductsByCategory);

export default router;
