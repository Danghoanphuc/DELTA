// apps/admin-backend/src/controllers/catalog.controller.ts
// ✅ Catalog Controller - Product Management API

import { Request, Response } from "express";
import {
  categoryService,
  supplierService,
  productService,
  skuVariantService,
  templateService,
} from "../services/catalog.service";

// ============================================
// CATEGORY CONTROLLERS
// ============================================
export const categoryController = {
  // GET /api/admin/catalog/categories
  async getCategories(req: Request, res: Response) {
    try {
      const { flat, activeOnly } = req.query;

      const categories =
        flat === "true"
          ? await categoryService.getCategoriesFlat()
          : await categoryService.getCategories({
              activeOnly: activeOnly === "true",
            });

      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/categories
  async createCategory(req: Request, res: Response) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/categories/:id
  async updateCategory(req: Request, res: Response) {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );
      if (!category) {
        return res
          .status(404)
          .json({ success: false, error: "Category not found" });
      }
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/admin/catalog/categories/:id
  async deleteCategory(req: Request, res: Response) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

// ============================================
// SUPPLIER CONTROLLERS
// ============================================
export const supplierController = {
  // GET /api/admin/catalog/suppliers
  async getSuppliers(req: Request, res: Response) {
    try {
      const { type, activeOnly, preferredOnly } = req.query;
      const suppliers = await supplierService.getSuppliers({
        type: type as string,
        activeOnly: activeOnly === "true",
        preferredOnly: preferredOnly === "true",
      });
      res.json({ success: true, data: suppliers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admin/catalog/suppliers/:id
  async getSupplierById(req: Request, res: Response) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      if (!supplier) {
        return res
          .status(404)
          .json({ success: false, error: "Supplier not found" });
      }
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/suppliers
  async createSupplier(req: Request, res: Response) {
    try {
      const supplier = await supplierService.createSupplier(req.body);
      res.status(201).json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/suppliers/:id
  async updateSupplier(req: Request, res: Response) {
    try {
      const supplier = await supplierService.updateSupplier(
        req.params.id,
        req.body
      );
      if (!supplier) {
        return res
          .status(404)
          .json({ success: false, error: "Supplier not found" });
      }
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/admin/catalog/suppliers/:id
  async deleteSupplier(req: Request, res: Response) {
    try {
      await supplierService.deleteSupplier(req.params.id);
      res.json({ success: true, message: "Supplier deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

// ============================================
// PRODUCT CONTROLLERS
// ============================================
export const productController = {
  // GET /api/admin/catalog/products
  async getProducts(req: Request, res: Response) {
    try {
      const {
        categoryId,
        supplierId,
        status,
        search,
        isFeatured,
        page,
        limit,
      } = req.query;

      const result = await productService.getProducts({
        categoryId: categoryId as string,
        supplierId: supplierId as string,
        status: status as string,
        search: search as string,
        isFeatured:
          isFeatured === "true"
            ? true
            : isFeatured === "false"
            ? false
            : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admin/catalog/products/:id
  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/products
  async createProduct(req: Request, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/products/:id
  async updateProduct(req: Request, res: Response) {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body
      );
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/admin/catalog/products/:id
  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/products/:id/duplicate
  async duplicateProduct(req: Request, res: Response) {
    try {
      const product = await productService.duplicateProduct(req.params.id);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

// ============================================
// SKU VARIANT CONTROLLERS
// ============================================
export const variantController = {
  // GET /api/admin/catalog/products/:productId/variants
  async getVariants(req: Request, res: Response) {
    try {
      const variants = await skuVariantService.getVariantsByProduct(
        req.params.productId
      );
      res.json({ success: true, data: variants });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admin/catalog/variants/sku/:sku
  async getVariantBySku(req: Request, res: Response) {
    try {
      const variant = await skuVariantService.getVariantBySku(req.params.sku);
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, error: "Variant not found" });
      }
      res.json({ success: true, data: variant });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/products/:productId/variants
  async createVariant(req: Request, res: Response) {
    try {
      const variant = await skuVariantService.createVariant({
        ...req.body,
        productId: req.params.productId,
      });
      res.status(201).json({ success: true, data: variant });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/products/:productId/variants/bulk
  async createBulkVariants(req: Request, res: Response) {
    try {
      const { combinations } = req.body;
      const variants = await skuVariantService.createBulkVariants(
        req.params.productId,
        combinations
      );
      res.status(201).json({ success: true, data: variants });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/variants/:id
  async updateVariant(req: Request, res: Response) {
    try {
      const variant = await skuVariantService.updateVariant(
        req.params.id,
        req.body
      );
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, error: "Variant not found" });
      }
      res.json({ success: true, data: variant });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/admin/catalog/variants/:id
  async deleteVariant(req: Request, res: Response) {
    try {
      await skuVariantService.deleteVariant(req.params.id);
      res.json({ success: true, message: "Variant deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/variants/:id/stock
  async updateStock(req: Request, res: Response) {
    try {
      const { quantity, operation } = req.body;
      const variant = await skuVariantService.updateStock(
        req.params.id,
        quantity,
        operation
      );
      res.json({ success: true, data: variant });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

// ============================================
// TEMPLATE CONTROLLERS
// ============================================
export const templateController = {
  // GET /api/admin/catalog/templates
  async getTemplates(req: Request, res: Response) {
    try {
      const { type, isPublic } = req.query;
      const templates = await templateService.getTemplates({
        type: type as string,
        isPublic:
          isPublic === "true" ? true : isPublic === "false" ? false : undefined,
      });
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admin/catalog/templates/:id
  async getTemplateById(req: Request, res: Response) {
    try {
      const template = await templateService.getTemplateById(req.params.id);
      if (!template) {
        return res
          .status(404)
          .json({ success: false, error: "Template not found" });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admin/catalog/templates
  async createTemplate(req: Request, res: Response) {
    try {
      const template = await templateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admin/catalog/templates/:id
  async updateTemplate(req: Request, res: Response) {
    try {
      const template = await templateService.updateTemplate(
        req.params.id,
        req.body
      );
      if (!template) {
        return res
          .status(404)
          .json({ success: false, error: "Template not found" });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/admin/catalog/templates/:id
  async deleteTemplate(req: Request, res: Response) {
    try {
      await templateService.deleteTemplate(req.params.id);
      res.json({ success: true, message: "Template deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
