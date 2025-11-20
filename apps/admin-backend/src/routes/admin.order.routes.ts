import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as orderController from "../controllers/admin.order.controller.js";
import { AdminRole } from "../models/admin.model.js";

const router = Router();
router.use(isAuthenticatedAdmin);

const readRoles: AdminRole[] = ["superadmin", "support"];

router.get("/", hasRole(readRoles), orderController.listOrders);
router.get("/:id", hasRole(readRoles), orderController.getOrderDetails);
router.patch(
  "/:id/status",
  hasRole(["superadmin", "support"]),
  orderController.forceUpdateOrderStatus
);

export default router;

