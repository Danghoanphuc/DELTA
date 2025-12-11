import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as orderController from "../controllers/admin.order.controller.js";
import { AdminRole } from "../models/admin.model.js";
import { requireFeature } from "../config/features.config.js";

const router = Router();
router.use(isAuthenticatedAdmin);

// ⚠️ FEATURE FLAG: MasterOrder system is disabled
// All routes will return 404 when MASTER_ORDER_SYSTEM = false
router.use(requireFeature("MASTER_ORDER_SYSTEM"));

const readRoles: AdminRole[] = ["superadmin", "support"];

router.get("/", hasRole(readRoles), orderController.listOrders);
router.get("/:id", hasRole(readRoles), orderController.getOrderDetails);
router.patch(
  "/:id/status",
  hasRole(["superadmin", "support"]),
  orderController.forceUpdateOrderStatus
);

// Shipper assignment
router.patch(
  "/:id/assign-shipper",
  hasRole(["superadmin", "support"]),
  orderController.assignShipper
);

router.delete(
  "/:id/assign-shipper",
  hasRole(["superadmin", "support"]),
  orderController.unassignShipper
);

export default router;
