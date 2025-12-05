// src/features/company-store/services/company-store.service.ts
// ✅ Company Store Service

import api from "@/shared/lib/axios";

export interface StoreProduct {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number | null;
  compareAtPrice?: number;
  allowSizeSelection: boolean;
  availableSizes: string[];
  maxPerOrder: number;
  inStock: boolean;
}

export interface StoreCategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface CompanyStore {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headerBgColor?: string;
    fontFamily: string;
    heroImageUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  access: {
    type: "public" | "private" | "password" | "email_domain";
    allowedDomains?: string[];
  };
  products: StoreProduct[];
  categories: StoreCategory[];
  settings: {
    showPrices: boolean;
    showInventory: boolean;
    enableBudget: boolean;
    defaultBudget?: number;
    requireApproval: boolean;
  };
  organization: {
    name: string;
    logo?: string;
  };
  status: string;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalVisitors: number;
  };
}

export interface CreateStoreData {
  name: string;
  tagline?: string;
  description?: string;
  branding?: Partial<CompanyStore["branding"]>;
  access?: Partial<CompanyStore["access"]>;
  settings?: Partial<CompanyStore["settings"]>;
}

export interface StoreProductData {
  product?: string;
  swagPack?: string;
  displayName?: string;
  displayDescription?: string;
  displayImage?: string;
  price: number;
  compareAtPrice?: number;
  trackInventory?: boolean;
  inventoryCount?: number;
  allowSizeSelection?: boolean;
  availableSizes?: string[];
  maxPerOrder?: number;
  maxPerPerson?: number;
  isActive?: boolean;
}

class CompanyStoreService {
  // === PUBLIC APIs ===

  async getPublicStore(slug: string, password?: string): Promise<CompanyStore> {
    const response = await api.get(`/company-store/public/${slug}`, {
      params: password ? { password } : undefined,
    });
    return response.data.data;
  }

  async getPublicStores(filters?: { page?: number; limit?: number }) {
    const response = await api.get("/company-store/public", {
      params: filters,
    });
    return response.data.data;
  }

  // === PRIVATE APIs (Organization) ===

  async createStore(data: CreateStoreData): Promise<CompanyStore> {
    const response = await api.post("/company-store", data);
    return response.data.data;
  }

  async getMyStore(): Promise<CompanyStore | null> {
    const response = await api.get("/company-store/me");
    return response.data.data;
  }

  async updateStore(data: Partial<CreateStoreData>): Promise<CompanyStore> {
    const response = await api.put("/company-store/me", data);
    return response.data.data;
  }

  async publishStore(): Promise<CompanyStore> {
    const response = await api.post("/company-store/me/publish");
    return response.data.data;
  }

  async unpublishStore(): Promise<CompanyStore> {
    const response = await api.post("/company-store/me/unpublish");
    return response.data.data;
  }

  // === PRODUCT MANAGEMENT ===

  async addProduct(data: StoreProductData): Promise<CompanyStore> {
    const response = await api.post("/company-store/me/products", data);
    return response.data.data;
  }

  async updateProduct(
    productId: string,
    data: Partial<StoreProductData>
  ): Promise<CompanyStore> {
    const response = await api.put(
      `/company-store/me/products/${productId}`,
      data
    );
    return response.data.data;
  }

  async removeProduct(productId: string): Promise<CompanyStore> {
    const response = await api.delete(
      `/company-store/me/products/${productId}`
    );
    return response.data.data;
  }

  // === CATEGORY MANAGEMENT ===

  async addCategory(data: {
    name: string;
    description?: string;
    icon?: string;
  }): Promise<CompanyStore> {
    const response = await api.post("/company-store/me/categories", data);
    return response.data.data;
  }

  async updateCategory(
    categoryId: string,
    data: { name?: string; description?: string; icon?: string }
  ): Promise<CompanyStore> {
    const response = await api.put(
      `/company-store/me/categories/${categoryId}`,
      data
    );
    return response.data.data;
  }

  async removeCategory(categoryId: string): Promise<CompanyStore> {
    const response = await api.delete(
      `/company-store/me/categories/${categoryId}`
    );
    return response.data.data;
  }
}

export const companyStoreService = new CompanyStoreService();
