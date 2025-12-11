// apps/customer-backend/src/routes/template.routes.js
// Template Routes

import { Router } from "express";
import { TemplateController } from "../controllers/template.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new TemplateController();

// All routes require authentication
router.use(authenticate);

// Template CRUD
router.post("/", controller.createTemplate);
router.get("/", controller.getTemplates);
router.get("/:id", controller.getTemplate);
router.put("/:id", controller.updateTemplate);
router.delete("/:id", controller.deleteTemplate);

// Get templates by context
router.get("/context/:contextType", controller.getTemplatesForContext);

// Get templates by category
router.get("/category/:category", controller.getTemplatesByCategory);

// Apply template (preview)
router.post("/:id/apply", controller.applyTemplate);

// Create thread from template
router.post("/:templateId/create-thread", controller.createThreadFromTemplate);

// Seed default templates
router.post("/seed-defaults", controller.seedDefaultTemplates);

export default router;
