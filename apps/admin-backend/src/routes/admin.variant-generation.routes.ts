// apps/admin-backend/src/routes/admin.variant-generation.routes.ts
// ✅ Phase 3.1.3: Variant Generation Routes

import { Router } from "express";
import { variantGenerationController } from "../controllers/admin.variant-generation.controller.js";

const router = Router();

/**
 * @route   POST /api/admin/catalog/products/:productId/generate-variants
 * @desc    Generate variants for a product
 * @access  Admin
 * @body    {
 *            attributeOptions: [
 *              { name: "size", values: ["S", "M", "L"], displayValues: ["Small", "Medium", "Large"] },
 *              { name: "color", values: ["Red", "Blue"] }
 *            ],
 *            options: {
 *              skuPrefix: "TSH",
 *              skuSeparator: "-",
 *              useProductPricing: true,
 *              priceAdjustment: 0,
 *              initialStock: 0,
 *              reorderPoint: 10,
 *              reorderQuantity: 50,
 *              defaultSupplierId: "supplier_id",
 *              setFirstAsDefault: true
 *            }
 *          }
 */
router.post(
  "/products/:productId/generate-variants",
  variantGenerationController.generateVariants
);

/**
 * @route   POST /api/admin/catalog/products/:productId/preview-variants
 * @desc    Preview variant combinations without creating them
 * @access  Admin
 * @body    {
 *            attributeOptions: [
 *              { name: "size", values: ["S", "M", "L"] },
 *              { name: "color", values: ["Red", "Blue"] }
 *            ]
 *          }
 */
router.post(
  "/products/:productId/preview-variants",
  variantGenerationController.previewVariants
);

/**
 * @route   PUT /api/admin/catalog/variants/:variantId/supplier-mapping
 * @desc    Update supplier mapping for a variant
 * @access  Admin
 * @body    {
 *            supplierId: "supplier_id",
 *            mapping: {
 *              supplierSku: "SUP-SKU-001",
 *              cost: 50000,
 *              leadTime: { min: 3, max: 7, unit: "days" },
 *              moq: 10,
 *              isPreferred: true
 *            }
 *          }
 */
router.put(
  "/variants/:variantId/supplier-mapping",
  variantGenerationController.updateSupplierMapping
);

/**
 * @route   PUT /api/admin/catalog/variants/:variantId/inventory
 * @desc    Update inventory for a variant
 * @access  Admin
 * @body    {
 *            onHand: 100,
 *            reserved: 20,
 *            reorderPoint: 10,
 *            reorderQuantity: 50
 *          }
 */
router.put(
  "/variants/:variantId/inventory",
  variantGenerationController.updateInventory
);

/**
 * @route   GET /api/admin/catalog/variants/low-stock
 * @desc    Get low stock variants
 * @access  Admin
 * @query   threshold (optional) - Stock threshold
 */
router.get(
  "/variants/low-stock",
  variantGenerationController.getLowStockVariants
);

export default router;
