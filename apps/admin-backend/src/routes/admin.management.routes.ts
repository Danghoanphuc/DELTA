import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import {
  listAdmins,
  createAdmin,
  updateAdmin,
} from "../controllers/admin.management.controller.js";

const router = Router();

router.use(isAuthenticatedAdmin, hasRole(["superadmin"]));

router.get("/", listAdmins);
router.post("/", createAdmin);
router.patch("/:id", updateAdmin);

export default router;

