// src/types/catalog-product.ts
// Type definitions for CatalogProduct from admin-backend

export interface CatalogProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CatalogProductCategory {
  _id: string;
  name: string;
  slug: string;
  path?: string;
}

export interface CatalogProductSupplier {
  _id: string;
  name: string;
  code: string;
  type?: string;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

export interface CatalogProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;

  // Category
  categoryId: CatalogProductCategory | string;
  categoryPath?: string;
  tags?: string[];

  // Supplier/Artisan
  supplierId?: CatalogProductSupplier | string;

  // Media
  images?: CatalogProductImage[];
  thumbnailUrl?: string;

  // Pricing
  basePrice: number;
  baseCost?: number;
  currency?: string;

  // Stats
  totalSold?: number;
  totalOrders?: number;
  averageRating?: number;
  reviewCount?: number;

  // Flags
  isFeatured?: boolean;
  isPublished?: boolean;
  status?: "draft" | "active" | "inactive" | "discontinued";

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Adapter function to convert CatalogProduct to Product format for compatibility
export function catalogProductToProduct(catalog: CatalogProduct): any {
  return {
    _id: catalog._id,
    name: catalog.name,
    slug: catalog.slug,
    sku: catalog.sku,
    description: catalog.description || catalog.shortDescription,
    category: catalog.categoryPath?.split("/")[0] || "other",
    images:
      catalog.images?.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })) ||
      (catalog.thumbnailUrl
        ? [{ url: catalog.thumbnailUrl, isPrimary: true }]
        : []),
    pricing: [
      {
        minQuantity: 1,
        pricePerUnit: catalog.basePrice,
      },
    ],
    totalSold: catalog.totalSold || 0,
    rating: catalog.averageRating || 0,
    totalReviews: catalog.reviewCount || 0,
    isActive: catalog.status === "active",
    createdAt: catalog.createdAt || new Date().toISOString(),
    updatedAt: catalog.updatedAt || new Date().toISOString(),
    // Additional fields for display
    basePrice: catalog.basePrice,
    thumbnailUrl: catalog.thumbnailUrl || catalog.images?.[0]?.url,
    tags: catalog.tags || [],
    isFeatured: catalog.isFeatured,
    supplier: catalog.supplierId,
    categoryInfo: catalog.categoryId,
    // Assets placeholder
    assets: { surfaces: [] },
  };
}
