// src/features/redemption/services/redemption.service.ts
// ✅ Redemption Link Service

import api from "@/shared/lib/axios";

export interface RedemptionItem {
  name: string;
  description?: string;
  imageUrl?: string;
  allowSizeSelection: boolean;
  availableSizes: string[];
  allowColorSelection: boolean;
  availableColors: { name: string; hex: string; imageUrl?: string }[];
  quantity: number;
  isRequired: boolean;
}

export interface RedemptionLink {
  id: string;
  name: string;
  description?: string;
  token: string;
  shortCode?: string;
  type: "single" | "bulk" | "unlimited";
  maxRedemptions: number;
  currentRedemptions: number;
  items: RedemptionItem[];
  branding: {
    logoUrl?: string;
    primaryColor: string;
    headerImageUrl?: string;
    welcomeTitle: string;
    welcomeMessage?: string;
    thankYouTitle: string;
    thankYouMessage?: string;
    senderName?: string;
  };
  settings: {
    requirePhone: boolean;
    requireAddress: boolean;
    customFields?: {
      name: string;
      label: string;
      type: string;
      required: boolean;
    }[];
  };
  organization: {
    name: string;
    logo?: string;
  };
  expiresAt?: string;
  status: string;
  stats: {
    views: number;
    uniqueViews: number;
    completed: number;
  };
  redemptions: any[];
  createdAt: string;
}

export interface CreateLinkData {
  name: string;
  description?: string;
  type?: "single" | "bulk" | "unlimited";
  maxRedemptions?: number;
  items: {
    product?: string;
    swagPack?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    allowSizeSelection?: boolean;
    availableSizes?: string[];
    allowColorSelection?: boolean;
    availableColors?: { name: string; hex: string }[];
    quantity?: number;
  }[];
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    welcomeTitle?: string;
    welcomeMessage?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    senderName?: string;
  };
  settings?: {
    requirePhone?: boolean;
    requireAddress?: boolean;
    autoCreateOrder?: boolean;
  };
  expiresAt?: string;
  campaign?: string;
  generateShortCode?: boolean;
}

export interface RedeemData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    street: string;
    ward?: string;
    district: string;
    city: string;
    country?: string;
  };
  selections: {
    itemIndex: number;
    selectedSize?: string;
    selectedColor?: string;
    quantity?: number;
  }[];
}

class RedemptionService {
  // === PUBLIC APIs ===

  async getPublicLink(token: string) {
    const response = await api.get(`/redemption/public/${token}`);
    return response.data.data;
  }

  async redeemLink(token: string, data: RedeemData) {
    const response = await api.post(`/redemption/public/${token}/redeem`, data);
    return response.data.data;
  }

  // === PRIVATE APIs (Organization) ===

  async createLink(data: CreateLinkData): Promise<RedemptionLink> {
    const response = await api.post("/redemption/links", data);
    return response.data.data;
  }

  async getLinks(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ links: RedemptionLink[]; pagination: any }> {
    const response = await api.get("/redemption/links", { params: filters });
    return response.data.data;
  }

  async getLinkDetail(id: string): Promise<RedemptionLink> {
    const response = await api.get(`/redemption/links/${id}`);
    return response.data.data;
  }

  async updateLink(
    id: string,
    data: Partial<CreateLinkData>
  ): Promise<RedemptionLink> {
    const response = await api.put(`/redemption/links/${id}`, data);
    return response.data.data;
  }

  async deleteLink(id: string): Promise<void> {
    await api.delete(`/redemption/links/${id}`);
  }

  async duplicateLink(id: string): Promise<RedemptionLink> {
    const response = await api.post(`/redemption/links/${id}/duplicate`);
    return response.data.data;
  }

  async getStats(dateRange?: { from?: string; to?: string }) {
    const response = await api.get("/redemption/links/stats", {
      params: dateRange,
    });
    return response.data.data;
  }
}

export const redemptionService = new RedemptionService();
