// apps/admin-backend/src/routes/catalog.routes.ts
// ✅ Catalog Routes - Product Management API

import { Router } from "express";
import {
  categoryController,
  supplierController,
  productController,
  variantController,
  templateController,
} from "../controllers/catalog.controller.js";

const router = Router();

// ============================================
// CATEGORY ROUTES
// ============================================
router.get("/categories", categoryController.getCategories);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// ============================================
// SUPPLIER ROUTES
// ============================================
router.get("/suppliers/compare", supplierController.compareSuppliers);
router.get("/suppliers", supplierController.getSuppliers);
router.get("/suppliers/:id", supplierController.getSupplierById);
router.post("/suppliers", supplierController.createSupplier);
router.put("/suppliers/:id", supplierController.updateSupplier);
router.delete("/suppliers/:id", supplierController.deleteSupplier);

// ============================================
// PRODUCT ROUTES
// ============================================
router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.post("/products/:id/duplicate", productController.duplicateProduct);

// ============================================
// VARIANT ROUTES
// ============================================
router.get("/products/:productId/variants", variantController.getVariants);
router.post("/products/:productId/variants", variantController.createVariant);
router.post(
  "/products/:productId/variants/bulk",
  variantController.createBulkVariants
);
router.get("/variants/sku/:sku", variantController.getVariantBySku);
router.put("/variants/:id", variantController.updateVariant);
router.delete("/variants/:id", variantController.deleteVariant);
router.put("/variants/:id/stock", variantController.updateStock);

// ============================================
// TEMPLATE ROUTES
// ============================================
router.get("/templates", templateController.getTemplates);
router.get("/templates/:id", templateController.getTemplateById);
router.post("/templates", templateController.createTemplate);
router.put("/templates/:id", templateController.updateTemplate);
router.delete("/templates/:id", templateController.deleteTemplate);

export default router;
