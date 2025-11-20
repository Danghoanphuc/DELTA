import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as contentController from "../controllers/admin.content.controller.js";

const router = Router();

router.use(
  isAuthenticatedAdmin,
  hasRole(["superadmin", "vetting"])
);

router.get("/pending", contentController.getPendingAssets);
router.post("/flag", contentController.flagAsset);

export default router;

