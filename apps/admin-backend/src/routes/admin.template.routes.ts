// apps/admin-backend/src/routes/admin.template.routes.ts
// ✅ PHASE 9.1.3: Template Routes - API endpoints for template management

import { Router } from "express";
import { TemplateController } from "../controllers/admin.template.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new TemplateController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/admin/templates/from-order/:orderId
 * @desc    Create template from existing order
 * @access  Private (Organization member)
 */
router.post("/from-order/:orderId", controller.createFromOrder);

/**
 * @route   GET /api/admin/templates
 * @desc    Get templates list
 * @access  Private (Organization member)
 * @query   type - Filter by template type
 * @query   isPublic - Filter by public/private
 * @query   isActive - Filter by active status
 */
router.get("/", controller.getTemplates);

/**
 * @route   GET /api/admin/templates/:id
 * @desc    Get template detail
 * @access  Private (Organization member or public template)
 */
router.get("/:id", controller.getTemplate);

/**
 * @route   GET /api/admin/templates/:id/load-for-reorder
 * @desc    Load template for reorder (checks availability)
 * @access  Private (Organization member or public template)
 */
router.get("/:id/load-for-reorder", controller.loadForReorder);

/**
 * @route   GET /api/admin/templates/:id/substitutes/:productId
 * @desc    Get suggested substitutes for a product
 * @access  Private
 */
router.get("/:id/substitutes/:productId", controller.getSuggestedSubstitutes);

/**
 * @route   PUT /api/admin/templates/:id/substitutes/:productId
 * @desc    Update template substitutes
 * @access  Private (Template owner)
 */
router.put("/:id/substitutes/:productId", controller.updateSubstitutes);

/**
 * @route   PUT /api/admin/templates/:id
 * @desc    Update template
 * @access  Private (Template owner)
 */
router.put("/:id", controller.updateTemplate);

/**
 * @route   DELETE /api/admin/templates/:id
 * @desc    Delete template
 * @access  Private (Template owner)
 */
router.delete("/:id", controller.deleteTemplate);

export default router;
