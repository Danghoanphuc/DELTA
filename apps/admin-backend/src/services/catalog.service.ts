// apps/admin-backend/src/services/catalog.service.ts
// ✅ Catalog Service - Product Management

import {
  ProductCategory,
  Supplier,
  CatalogProduct,
  SkuVariant,
  ProductTemplate,
  IProductCategory,
  ISupplier,
  ICatalogProduct,
  ISkuVariant,
  IProductTemplate,
} from "../models/catalog.models";
import mongoose from "mongoose";

// ============================================
// CATEGORY SERVICE
// ============================================
export class CategoryService {
  // Get all categories (tree structure)
  async getCategories(options?: { activeOnly?: boolean }) {
    const filter: any = {};
    if (options?.activeOnly) filter.isActive = true;

    const categories = await ProductCategory.find(filter)
      .sort({ level: 1, sortOrder: 1 })
      .lean();

    // Build tree structure
    return this.buildCategoryTree(categories);
  }

  private buildCategoryTree(categories: any[]) {
    const map = new Map();
    const roots: any[] = [];

    categories.forEach((cat) => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat._id.toString());
      if (cat.parentId) {
        const parent = map.get(cat.parentId.toString());
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Get flat list
  async getCategoriesFlat() {
    return ProductCategory.find({ isActive: true }).sort({ path: 1 }).lean();
  }

  // Create category
  async createCategory(data: Partial<IProductCategory>) {
    // Generate slug
    const slug = this.generateSlug(data.name!);

    // Calculate path and level
    let path = slug;
    let level = 0;

    if (data.parentId) {
      const parent = await ProductCategory.findById(data.parentId);
      if (parent) {
        path = `${parent.path}/${slug}`;
        level = parent.level + 1;
      }
    }

    const category = new ProductCategory({
      ...data,
      slug,
      path,
      level,
    });

    return category.save();
  }

  // Update category
  async updateCategory(id: string, data: Partial<IProductCategory>) {
    return ProductCategory.findByIdAndUpdate(id, data, { new: true });
  }

  // Delete category
  async deleteCategory(id: string) {
    // Check if has children
    const hasChildren = await ProductCategory.exists({ parentId: id });
    if (hasChildren) {
      throw new Error("Cannot delete category with children");
    }

    // Check if has products
    const hasProducts = await CatalogProduct.exists({ categoryId: id });
    if (hasProducts) {
      throw new Error("Cannot delete category with products");
    }

    return ProductCategory.findByIdAndDelete(id);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}

// ============================================
// SUPPLIER SERVICE
// ============================================
export class SupplierService {
  async getSuppliers(options?: {
    type?: string;
    activeOnly?: boolean;
    preferredOnly?: boolean;
  }) {
    const filter: any = {};
    if (options?.type) filter.type = options.type;
    if (options?.activeOnly) filter.isActive = true;
    if (options?.preferredOnly) filter.isPreferred = true;

    return Supplier.find(filter).sort({ isPreferred: -1, name: 1 }).lean();
  }

  async getSupplierById(id: string) {
    return Supplier.findById(id).lean();
  }

  async createSupplier(data: Partial<ISupplier>) {
    const supplier = new Supplier(data);
    return supplier.save();
  }

  async updateSupplier(id: string, data: Partial<ISupplier>) {
    return Supplier.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSupplier(id: string) {
    // Check if has products
    const hasProducts = await CatalogProduct.exists({ supplierId: id });
    if (hasProducts) {
      throw new Error("Cannot delete supplier with products");
    }
    return Supplier.findByIdAndDelete(id);
  }
}

// ============================================
// PRODUCT SERVICE
// ============================================
export class ProductService {
  async getProducts(options?: {
    categoryId?: string;
    supplierId?: string;
    status?: string;
    search?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};

    if (options?.categoryId) filter.categoryId = options.categoryId;
    if (options?.supplierId) filter.supplierId = options.supplierId;
    if (options?.status) filter.status = options.status;
    if (options?.isFeatured !== undefined)
      filter.isFeatured = options.isFeatured;

    if (options?.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { sku: { $regex: options.search, $options: "i" } },
        { tags: { $in: [new RegExp(options.search, "i")] } },
      ];
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      CatalogProduct.find(filter)
        .populate("categoryId", "name path")
        .populate("supplierId", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CatalogProduct.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await CatalogProduct.findById(id)
      .populate("categoryId", "name path")
      .populate("supplierId", "name code contactInfo")
      .lean();

    if (!product) return null;

    // Get variants
    const variants = await SkuVariant.find({ productId: id, isActive: true })
      .sort({ isDefault: -1, sku: 1 })
      .lean();

    return { ...product, variants };
  }

  async createProduct(data: Partial<ICatalogProduct>) {
    // Generate slug and SKU
    const slug = this.generateSlug(data.name!);
    const sku = data.sku || this.generateSku(data.name!);

    // Get category path
    let categoryPath = "";
    if (data.categoryId) {
      const category = await ProductCategory.findById(data.categoryId);
      if (category) categoryPath = category.path;
    }

    const product = new CatalogProduct({
      ...data,
      slug,
      sku,
      categoryPath,
    });

    const saved = await product.save();

    // Update category product count
    if (data.categoryId) {
      await ProductCategory.findByIdAndUpdate(data.categoryId, {
        $inc: { productCount: 1 },
      });
    }

    return saved;
  }

  async updateProduct(id: string, data: Partial<ICatalogProduct>) {
    const product = await CatalogProduct.findById(id);
    if (!product) throw new Error("Product not found");

    // If category changed, update counts
    if (
      data.categoryId &&
      data.categoryId.toString() !== product.categoryId.toString()
    ) {
      await ProductCategory.findByIdAndUpdate(product.categoryId, {
        $inc: { productCount: -1 },
      });
      await ProductCategory.findByIdAndUpdate(data.categoryId, {
        $inc: { productCount: 1 },
      });

      // Update category path
      const newCategory = await ProductCategory.findById(data.categoryId);
      if (newCategory) data.categoryPath = newCategory.path;
    }

    return CatalogProduct.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProduct(id: string) {
    const product = await CatalogProduct.findById(id);
    if (!product) throw new Error("Product not found");

    // Delete variants
    await SkuVariant.deleteMany({ productId: id });

    // Update category count
    await ProductCategory.findByIdAndUpdate(product.categoryId, {
      $inc: { productCount: -1 },
    });

    return CatalogProduct.findByIdAndDelete(id);
  }

  async duplicateProduct(id: string) {
    const product = await CatalogProduct.findById(id).lean();
    if (!product) throw new Error("Product not found");

    const { _id, sku, slug, createdAt, updatedAt, ...rest } = product as any;

    const newProduct = new CatalogProduct({
      ...rest,
      name: `${rest.name} (Copy)`,
      sku: this.generateSku(rest.name),
      slug: this.generateSlug(`${rest.name}-copy`),
      status: "draft",
      isPublished: false,
      totalSold: 0,
      totalOrders: 0,
    });

    return newProduct.save();
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `${base}-${Date.now().toString(36)}`;
  }

  private generateSku(name: string): string {
    const prefix = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
  }
}

// ============================================
// SKU VARIANT SERVICE
// ============================================
export class SkuVariantService {
  async getVariantsByProduct(productId: string) {
    return SkuVariant.find({ productId, isActive: true })
      .sort({ isDefault: -1, sku: 1 })
      .lean();
  }

  async getVariantBySku(sku: string) {
    return SkuVariant.findOne({ sku: sku.toUpperCase() })
      .populate("productId", "name images basePrice")
      .lean();
  }

  async createVariant(data: Partial<ISkuVariant>) {
    // Generate SKU if not provided
    if (!data.sku) {
      const product = await CatalogProduct.findById(data.productId);
      if (product) {
        const attrSuffix = data.attributes
          ?.map((a) => a.value.substring(0, 2).toUpperCase())
          .join("-");
        data.sku = `${product.sku}-${attrSuffix}`;
      }
    }

    // Generate name
    if (!data.name && data.attributes) {
      const product = await CatalogProduct.findById(data.productId);
      const attrStr = data.attributes.map((a) => a.value).join(" - ");
      data.name = `${product?.name} - ${attrStr}`;
    }

    const variant = new SkuVariant(data);
    const saved = await variant.save();

    // Update product hasVariants flag
    await CatalogProduct.findByIdAndUpdate(data.productId, {
      hasVariants: true,
    });

    return saved;
  }

  async createBulkVariants(
    productId: string,
    attributeCombinations: { name: string; value: string }[][]
  ) {
    const product = await CatalogProduct.findById(productId);
    if (!product) throw new Error("Product not found");

    const variants = attributeCombinations.map((attrs, index) => {
      const attrSuffix = attrs
        .map((a) => a.value.substring(0, 2).toUpperCase())
        .join("-");
      const attrStr = attrs.map((a) => a.value).join(" - ");

      return {
        productId,
        sku: `${product.sku}-${attrSuffix}`,
        name: `${product.name} - ${attrStr}`,
        attributes: attrs,
        price: product.basePrice,
        cost: product.baseCost,
        isDefault: index === 0,
      };
    });

    const created = await SkuVariant.insertMany(variants);

    // Update product
    await CatalogProduct.findByIdAndUpdate(productId, {
      hasVariants: true,
      variantAttributes: [
        ...new Set(attributeCombinations.flat().map((a) => a.name)),
      ],
    });

    return created;
  }

  async updateVariant(id: string, data: Partial<ISkuVariant>) {
    return SkuVariant.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteVariant(id: string) {
    const variant = await SkuVariant.findById(id);
    if (!variant) throw new Error("Variant not found");

    await SkuVariant.findByIdAndDelete(id);

    // Check if product still has variants
    const remainingCount = await SkuVariant.countDocuments({
      productId: variant.productId,
    });

    if (remainingCount === 0) {
      await CatalogProduct.findByIdAndUpdate(variant.productId, {
        hasVariants: false,
        variantAttributes: [],
      });
    }

    return variant;
  }

  async updateStock(
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ) {
    const update: any = {};

    if (operation === "set") {
      update.stockQuantity = quantity;
    } else if (operation === "add") {
      update.$inc = { stockQuantity: quantity };
    } else {
      update.$inc = { stockQuantity: -quantity };
    }

    return SkuVariant.findByIdAndUpdate(id, update, { new: true });
  }

  async reserveStock(id: string, quantity: number) {
    return SkuVariant.findByIdAndUpdate(
      id,
      { $inc: { reservedQuantity: quantity } },
      { new: true }
    );
  }

  async releaseStock(id: string, quantity: number) {
    return SkuVariant.findByIdAndUpdate(
      id,
      { $inc: { reservedQuantity: -quantity } },
      { new: true }
    );
  }
}

// ============================================
// TEMPLATE SERVICE
// ============================================
export class TemplateService {
  async getTemplates(options?: { type?: string; isPublic?: boolean }) {
    const filter: any = { isActive: true };
    if (options?.type) filter.type = options.type;
    if (options?.isPublic !== undefined) filter.isPublic = options.isPublic;

    return ProductTemplate.find(filter)
      .populate("items.productId", "name thumbnailUrl basePrice")
      .sort({ timesUsed: -1 })
      .lean();
  }

  async getTemplateById(id: string) {
    return ProductTemplate.findById(id)
      .populate("items.productId", "name thumbnailUrl basePrice images")
      .lean();
  }

  async createTemplate(data: Partial<IProductTemplate>) {
    // Calculate estimated pricing
    const items = data.items || [];
    let estimatedCost = 0;
    let estimatedPrice = 0;

    for (const item of items) {
      const product = await CatalogProduct.findById(item.productId);
      if (product) {
        estimatedCost += (product.baseCost || 0) * item.quantity;
        estimatedPrice += product.basePrice * item.quantity;
      }
    }

    const template = new ProductTemplate({
      ...data,
      estimatedCost,
      estimatedPrice,
    });

    return template.save();
  }

  async updateTemplate(id: string, data: Partial<IProductTemplate>) {
    return ProductTemplate.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTemplate(id: string) {
    return ProductTemplate.findByIdAndDelete(id);
  }

  async incrementUsage(id: string) {
    return ProductTemplate.findByIdAndUpdate(id, { $inc: { timesUsed: 1 } });
  }
}

// ============================================
// EXPORT SINGLETON INSTANCES
// ============================================
export const categoryService = new CategoryService();
export const supplierService = new SupplierService();
export const productService = new ProductService();
export const skuVariantService = new SkuVariantService();
export const templateService = new TemplateService();
