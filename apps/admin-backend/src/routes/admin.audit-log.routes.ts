import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import { getAuditLogs } from "../controllers/admin.audit-log.controller.js";

const router = Router();

router.use(isAuthenticatedAdmin, hasRole(["superadmin"]));

router.get("/", getAuditLogs);

export default router;

