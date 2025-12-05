// apps/admin-frontend/src/services/catalog.service.ts
// ✅ Catalog Service - Frontend API calls

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_URL}/api/admin/catalog`,
  headers: { "Content-Type": "application/json" },
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export interface Supplier {
  _id: string;
  name: string;
  code: string;
  type: "manufacturer" | "distributor" | "printer" | "dropshipper";
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
    const { data } = await api.get(`/categories?flat=${flat}`);
    return data.data as Category[];
  },

  create: async (category: Partial<Category>) => {
    const { data } = await api.post("/categories", category);
    return data.data as Category;
  },

  update: async (id: string, category: Partial<Category>) => {
    const { data } = await api.put(`/categories/${id}`, category);
    return data.data as Category;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

// ============================================
// SUPPLIER API
// ============================================
export const supplierApi = {
  getAll: async (options?: { type?: string; activeOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.activeOnly) params.append("activeOnly", "true");
    const { data } = await api.get(`/suppliers?${params}`);
    return data.data as Supplier[];
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/suppliers/${id}`);
    return data.data as Supplier;
  },

  create: async (supplier: Partial<Supplier>) => {
    const { data } = await api.post("/suppliers", supplier);
    return data.data as Supplier;
  },

  update: async (id: string, supplier: Partial<Supplier>) => {
    const { data } = await api.put(`/suppliers/${id}`, supplier);
    return data.data as Supplier;
  },

  delete: async (id: string) => {
    await api.delete(`/suppliers/${id}`);
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

    const { data } = await api.get(`/products?${params}`);
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
    const { data } = await api.get(`/products/${id}`);
    return data.data as Product;
  },

  create: async (product: Partial<Product>) => {
    const { data } = await api.post("/products", product);
    return data.data as Product;
  },

  update: async (id: string, product: Partial<Product>) => {
    const { data } = await api.put(`/products/${id}`, product);
    return data.data as Product;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  duplicate: async (id: string) => {
    const { data } = await api.post(`/products/${id}/duplicate`);
    return data.data as Product;
  },
};

// ============================================
// VARIANT API
// ============================================
export const variantApi = {
  getByProduct: async (productId: string) => {
    const { data } = await api.get(`/products/${productId}/variants`);
    return data.data as SkuVariant[];
  },

  getBySku: async (sku: string) => {
    const { data } = await api.get(`/variants/sku/${sku}`);
    return data.data as SkuVariant;
  },

  create: async (productId: string, variant: Partial<SkuVariant>) => {
    const { data } = await api.post(`/products/${productId}/variants`, variant);
    return data.data as SkuVariant;
  },

  createBulk: async (
    productId: string,
    combinations: { name: string; value: string }[][]
  ) => {
    const { data } = await api.post(`/products/${productId}/variants/bulk`, {
      combinations,
    });
    return data.data as SkuVariant[];
  },

  update: async (id: string, variant: Partial<SkuVariant>) => {
    const { data } = await api.put(`/variants/${id}`, variant);
    return data.data as SkuVariant;
  },

  delete: async (id: string) => {
    await api.delete(`/variants/${id}`);
  },

  updateStock: async (
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ) => {
    const { data } = await api.put(`/variants/${id}/stock`, {
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
    const { data } = await api.get(`/templates?${params}`);
    return data.data as ProductTemplate[];
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/templates/${id}`);
    return data.data as ProductTemplate;
  },

  create: async (template: Partial<ProductTemplate>) => {
    const { data } = await api.post("/templates", template);
    return data.data as ProductTemplate;
  },

  update: async (id: string, template: Partial<ProductTemplate>) => {
    const { data } = await api.put(`/templates/${id}`, template);
    return data.data as ProductTemplate;
  },

  delete: async (id: string) => {
    await api.delete(`/templates/${id}`);
  },
};
