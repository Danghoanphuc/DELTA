// apps/customer-frontend/src/services/artisan.service.ts
// Service for public artisan/supplier profiles

import api from "@/shared/lib/axios";

export interface ArtisanProfile {
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

export interface Artisan {
  _id: string;
  name: string;
  code: string;
  type: "manufacturer" | "distributor" | "printer" | "dropshipper" | "artisan";
  contactInfo: {
    city?: string;
    country?: string;
  };
  capabilities: string[];
  rating: number;
  isPreferred: boolean;
  profile?: ArtisanProfile;
}

export interface ArtisanPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  subcategory?: string;
  readTime?: number;
  featured: boolean;
  media: Array<{
    type: "image" | "video";
    url: string;
  }>;
  tags: string[];
  createdAt: string;
  authorProfile?: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  ogImage?: string;
}

export interface ArtisanProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  thumbnailUrl?: string;
  images?: Array<{ url: string; isPrimary: boolean }>;
  basePrice: number;
  tags: string[];
  totalSold: number;
  isFeatured: boolean;
}

class ArtisanService {
  /**
   * Get list of artisans
   */
  async getArtisans(options?: {
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const { data } = await api.get(`/artisans?${params}`);
    return data.data as {
      artisans: Artisan[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }

  /**
   * Get artisan profile by code
   */
  async getArtisanByCode(code: string) {
    const { data } = await api.get(`/artisans/${code}`);
    return data.data.artisan as Artisan;
  }

  /**
   * Get artisan's posts
   */
  async getArtisanPosts(
    code: string,
    options?: { page?: number; limit?: number }
  ) {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const { data } = await api.get(`/artisans/${code}/posts?${params}`);
    return data.data as {
      posts: ArtisanPost[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }

  /**
   * Get artisan's products
   */
  async getArtisanProducts(
    code: string,
    options?: { page?: number; limit?: number }
  ) {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const { data } = await api.get(`/artisans/${code}/products?${params}`);
    return data.data as {
      products: ArtisanProduct[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }
}

export const artisanService = new ArtisanService();
