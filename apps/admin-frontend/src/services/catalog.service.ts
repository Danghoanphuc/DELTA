// apps/admin-frontend/src/services/catalog.service.ts
// ✅ Catalog Service - Frontend API calls

import api from "@/lib/axios";

// ============================================
// TYPES
// ============================================
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children?: Category[];
}

export interface SupplierProfile {
  avatar?: string;
  coverImage?: string;
  bio?: string;
  story?: string;
  quote?: string;
  curatorNote?: string;
  yearsOfExperience?: number;
  achievements?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

export interface Supplier {
  _id: string;
  name: string;
  code: string;
  type: "manufacturer" | "distributor" | "printer" | "dropshipper" | "artisan";
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  capabilities: string[];
  leadTime: { min: number; max: number; unit: string };
  minimumOrderQuantity: number;
  rating: number;
  isActive: boolean;
  isPreferred: boolean;
  profile?: SupplierProfile;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  categoryId: Category | string;
  categoryPath: string;
  tags: string[];
  supplierId?: Supplier | string;
  supplierSku?: string;
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  thumbnailUrl?: string;
  baseCost: number;
  basePrice: number;
  pricingTiers: {
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
    discount?: number;
  }[];
  hasVariants: boolean;
  variantAttributes: string[];
  specifications: {
    material?: string;
    weight?: number;
    weightUnit?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
  };
  customization: {
    allowLogo: boolean;
    logoPositions?: string[];
    allowPersonalization: boolean;
    personalizationFields?: string[];
    printMethods?: string[];
    setupFee?: number;
  };
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  status: "draft" | "active" | "inactive" | "discontinued";
  isPublished: boolean;
  isFeatured: boolean;
  totalSold: number;
  variants?: SkuVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface SkuVariant {
  _id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: { name: string; value: string; displayValue?: string }[];
  price?: number;
  cost?: number;
  imageUrl?: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isDefault: boolean;
  barcode?: string;
}

export interface ProductTemplate {
  _id: string;
  name: string;
  description?: string;
  type: string;
  items: {
    productId: Product | string;
    productName: string;
    quantity: number;
    isRequired: boolean;
  }[];
  estimatedCost: number;
  estimatedPrice: number;
  isActive: boolean;
  isPublic: boolean;
  timesUsed: number;
}

// ============================================
// CATEGORY API
// ============================================
export const categoryApi = {
  getAll: async (flat = false) => {
    const { data } = await api.get(`/admin/catalog/categories?flat=${flat}`);
    return data.data as Category[];
  },

  create: async (category: Partial<Category>) => {
    const { data } = await api.post("/admin/catalog/categories", category);
    return data.data as Category;
  },

  update: async (id: string, category: Partial<Category>) => {
    const { data } = await api.put(`/admin/catalog/categories/${id}`, category);
    return data.data as Category;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/catalog/categories/${id}`);
  },
};

// ============================================
// SUPPLIER API
// ============================================

export interface SupplierPerformanceMetrics {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  totalOrders: number;
  completedOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number;
  totalQCChecks: number;
  passedQCChecks: number;
  failedQCChecks: number;
  qualityScore: number;
  averageLeadTime: number;
  minLeadTime: number;
  maxLeadTime: number;
  averageCost: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface LeadTimeRecord {
  productionOrderId: string;
  productionOrderNumber: string;
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date;
  leadTimeDays: number;
  wasOnTime: boolean;
}

export interface SupplierComparison {
  supplierId: string;
  supplierName: string;
  onTimeRate: number;
  qualityScore: number;
  averageLeadTime: number;
  averageCost: number;
  totalOrders: number;
  rating: number;
}

export const supplierApi = {
  getAll: async (options?: { type?: string; activeOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.activeOnly) params.append("activeOnly", "true");
    const { data } = await api.get(`/admin/catalog/suppliers?${params}`);
    return data.data as Supplier[];
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/admin/catalog/suppliers/${id}`);
    return data.data as Supplier;
  },

  create: async (supplier: Partial<Supplier>) => {
    const { data } = await api.post("/admin/catalog/suppliers", supplier);
    return data.data as Supplier;
  },

  update: async (id: string, supplier: Partial<Supplier>) => {
    const { data } = await api.put(`/admin/catalog/suppliers/${id}`, supplier);
    return data.data as Supplier;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/catalog/suppliers/${id}`);
  },

  // Performance tracking
  getPerformance: async (id: string) => {
    const { data } = await api.get(`/admin/suppliers/${id}/performance`);
    return data.data as SupplierPerformanceMetrics;
  },

  getLeadTimeHistory: async (id: string) => {
    const { data } = await api.get(`/admin/suppliers/${id}/lead-time-history`);
    return data.data as LeadTimeRecord[];
  },

  updateRating: async (id: string, rating: number) => {
    const { data } = await api.put(`/admin/suppliers/${id}/rating`, {
      rating,
    });
    return data.data as Supplier;
  },

  compareSuppliers: async (supplierIds?: string[]) => {
    const params = new URLSearchParams();
    if (supplierIds && supplierIds.length > 0) {
      params.append("ids", supplierIds.join(","));
    }
    const { data } = await api.get(`/admin/suppliers/compare?${params}`);
    return data.data as SupplierComparison[];
  },

  // Supplier posts
  createPost: async (
    supplierId: string,
    postData: {
      // Content - EITHER content (legacy HTML) OR blocks (Artisan Block)
      title?: string;
      excerpt?: string;
      category?: string;
      subcategory?: string;
      readTime?: number;
      featured?: boolean;
      content?: string; // Legacy HTML content (optional now)
      blocks?: Array<{
        // NEW: Artisan Block array
        id: string;
        type: string;
        order: number;
        content?: Record<string, any>;
        data?: Record<string, any>;
        settings?: Record<string, any>;
      }>;
      editorMode?: "richtext" | "artisan"; // Track editor type
      media?: Array<{
        type: "image" | "video";
        url: string;
        thumbnail?: string;
      }>;
      visibility?: "public" | "private" | "draft";
      tags?: string[];
      // SEO
      slug?: string;
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      schemaType?: "Article" | "FAQ" | "ProductReview";
      // Sales
      relatedProducts?: string[];
      relatedPosts?: string[];
      highlightQuote?: string;
      // Author
      authorProfile?: {
        name: string;
        title: string;
        avatar?: string;
        bio?: string;
      };
    }
  ) => {
    const { data } = await api.post(
      `/admin/suppliers/${supplierId}/posts`,
      postData
    );
    return data.data;
  },

  getPostsBySupplier: async (supplierId: string, visibility?: string) => {
    const params = new URLSearchParams();
    if (visibility) params.append("visibility", visibility);
    const { data } = await api.get(
      `/admin/suppliers/${supplierId}/posts?${params}`
    );
    return data.data;
  },

  // Get all posts across all suppliers (for related posts picker)
  getAllPosts: async (options?: {
    visibility?: string;
    category?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.visibility) params.append("visibility", options.visibility);
    if (options?.category) params.append("category", options.category);
    if (options?.limit) params.append("limit", String(options.limit));
    const { data } = await api.get(`/admin/supplier-posts?${params}`);
    return {
      posts: data.data?.posts || data.posts || [],
      pagination: data.data?.pagination || data.pagination,
    };
  },

  updatePost: async (
    postId: string,
    postData: {
      // Content - EITHER content (legacy HTML) OR blocks (Artisan Block)
      title?: string;
      excerpt?: string;
      category?: string;
      subcategory?: string;
      readTime?: number;
      featured?: boolean;
      content?: string; // Legacy HTML content
      blocks?: Array<{
        // NEW: Artisan Block array
        id: string;
        type: string;
        order: number;
        content?: Record<string, any>;
        data?: Record<string, any>;
        settings?: Record<string, any>;
      }>;
      editorMode?: "richtext" | "artisan";
      media?: Array<{
        type: "image" | "video";
        url: string;
        thumbnail?: string;
      }>;
      visibility?: "public" | "private" | "draft";
      tags?: string[];
      // SEO
      slug?: string;
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      schemaType?: "Article" | "FAQ" | "ProductReview";
      // Sales
      relatedProducts?: string[];
      relatedPosts?: string[];
      highlightQuote?: string;
      // Author
      authorProfile?: {
        name: string;
        title: string;
        avatar?: string;
        bio?: string;
      };
    }
  ) => {
    const { data } = await api.put(`/admin/supplier-posts/${postId}`, postData);
    return data.data;
  },

  deletePost: async (postId: string) => {
    const { data } = await api.delete(`/admin/supplier-posts/${postId}`);
    return data;
  },
};

// ============================================
// PRODUCT API
// ============================================
export const productApi = {
  getAll: async (options?: {
    categoryId?: string;
    supplierId?: string;
    status?: string;
    search?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.categoryId) params.append("categoryId", options.categoryId);
    if (options?.supplierId) params.append("supplierId", options.supplierId);
    if (options?.status) params.append("status", options.status);
    if (options?.search) params.append("search", options.search);
    if (options?.isFeatured !== undefined)
      params.append("isFeatured", String(options.isFeatured));
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));

    const { data } = await api.get(`/admin/catalog/products?${params}`);
    return {
      products: data.products as Product[],
      pagination: data.pagination as {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      },
    };
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/admin/catalog/products/${id}`);
    return data.data as Product;
  },

  create: async (product: Partial<Product>) => {
    const { data } = await api.post("/admin/catalog/products", product);
    return data.data as Product;
  },

  update: async (id: string, product: Partial<Product>) => {
    const { data } = await api.put(`/admin/catalog/products/${id}`, product);
    return data.data as Product;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/catalog/products/${id}`);
  },

  duplicate: async (id: string) => {
    const { data } = await api.post(`/admin/catalog/products/${id}/duplicate`);
    return data.data as Product;
  },
};

// ============================================
// VARIANT API
// ============================================
export const variantApi = {
  getByProduct: async (productId: string) => {
    const { data } = await api.get(
      `/admin/catalog/products/${productId}/variants`
    );
    return data.data as SkuVariant[];
  },

  getBySku: async (sku: string) => {
    const { data } = await api.get(`/admin/catalog/variants/sku/${sku}`);
    return data.data as SkuVariant;
  },

  create: async (productId: string, variant: Partial<SkuVariant>) => {
    const { data } = await api.post(
      `/admin/catalog/products/${productId}/variants`,
      variant
    );
    return data.data as SkuVariant;
  },

  createBulk: async (
    productId: string,
    combinations: { name: string; value: string }[][]
  ) => {
    const { data } = await api.post(
      `/admin/catalog/products/${productId}/variants/bulk`,
      {
        combinations,
      }
    );
    return data.data as SkuVariant[];
  },

  update: async (id: string, variant: Partial<SkuVariant>) => {
    const { data } = await api.put(`/admin/catalog/variants/${id}`, variant);
    return data.data as SkuVariant;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/catalog/variants/${id}`);
  },

  updateStock: async (
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ) => {
    const { data } = await api.put(`/admin/catalog/variants/${id}/stock`, {
      quantity,
      operation,
    });
    return data.data as SkuVariant;
  },
};

// ============================================
// TEMPLATE API
// ============================================
export const templateApi = {
  getAll: async (options?: { type?: string; isPublic?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.isPublic !== undefined)
      params.append("isPublic", String(options.isPublic));
    const { data } = await api.get(`/admin/catalog/templates?${params}`);
    return data.data as ProductTemplate[];
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/admin/catalog/templates/${id}`);
    return data.data as ProductTemplate;
  },

  create: async (template: Partial<ProductTemplate>) => {
    const { data } = await api.post("/admin/catalog/templates", template);
    return data.data as ProductTemplate;
  },

  update: async (id: string, template: Partial<ProductTemplate>) => {
    const { data } = await api.put(`/admin/catalog/templates/${id}`, template);
    return data.data as ProductTemplate;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/catalog/templates/${id}`);
  },
};

// ============================================
// CATALOG SERVICE (Wrapper for easy use)
// ============================================
class CatalogService {
  // Categories
  getCategories = categoryApi.getAll;
  createCategory = categoryApi.create;
  updateCategory = categoryApi.update;
  deleteCategory = categoryApi.delete;

  // Suppliers
  getSuppliers = supplierApi.getAll;
  getSupplier = supplierApi.getById;
  createSupplier = supplierApi.create;
  updateSupplier = supplierApi.update;
  deleteSupplier = supplierApi.delete;

  // Products
  getProducts = productApi.getAll;
  getProduct = productApi.getById;
  createProduct = productApi.create;
  updateProduct = productApi.update;
  deleteProduct = productApi.delete;
  duplicateProduct = productApi.duplicate;

  // Variants
  getVariants = variantApi.getByProduct;
  getVariantBySku = variantApi.getBySku;
  createVariant = variantApi.create;
  createVariantsBulk = variantApi.createBulk;
  updateVariant = variantApi.update;
  deleteVariant = variantApi.delete;
  updateVariantStock = variantApi.updateStock;

  // Templates
  getTemplates = templateApi.getAll;
  getTemplate = templateApi.getById;
  createTemplate = templateApi.create;
  updateTemplate = templateApi.update;
  deleteTemplate = templateApi.delete;
}

export const catalogService = new CatalogService();
export default catalogService;
