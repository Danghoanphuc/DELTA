// apps/admin-backend/src/routes/admin.product.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as controller from "../controllers/admin.product.controller.js";

const router = Router();
router.use(isAuthenticatedAdmin, hasRole(["superadmin", "support"]));

router.get("/", controller.handleGetAllProducts);
router.get("/:id", controller.handleGetProductById);
router.patch("/:id/status", controller.handleUpdateProductStatus);

export default router;
