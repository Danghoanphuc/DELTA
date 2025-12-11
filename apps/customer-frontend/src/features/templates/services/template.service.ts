// apps/customer-frontend/src/features/templates/services/template.service.ts
// ✅ PHASE 9.2: Template Service - API calls for template management

import api from "@/shared/lib/axios";

export interface ProductTemplate {
  _id: string;
  name: string;
  description?: string;
  type: "welcome_kit" | "event_swag" | "client_gift" | "holiday" | "custom";
  organizationId?: string;
  items: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    isRequired: boolean;
    allowSubstitute: boolean;
    substituteProducts?: {
      productId: string;
      productName: string;
      productSku: string;
      reason?: string;
    }[];
  }[];
  defaultCustomization: {
    includeLogo: boolean;
    logoPosition?: string;
    includePersonalization: boolean;
    personalizationFields?: string[];
  };
  packaging: {
    boxType: string;
    includeCard: boolean;
    defaultMessage?: string;
  };
  estimatedCost: number;
  estimatedPrice: number;
  isActive: boolean;
  isPublic: boolean;
  usageTracking: {
    timesUsed: number;
    lastUsedAt?: string;
    lastUsedBy?: string;
    totalRevenue: number;
    averageOrderValue: number;
  };
  orderHistory: {
    orderId: string;
    orderNumber: string;
    organizationId: string;
    createdAt: string;
    totalAmount: number;
    recipientCount: number;
  }[];
  discontinuedProducts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoadTemplateResult {
  template: ProductTemplate;
  availability: {
    allAvailable: boolean;
    unavailableProducts: {
      productId: string;
      productName: string;
      suggestedSubstitutes: string[];
    }[];
  };
  needsUpdate: boolean;
}

export interface SubstituteProduct {
  productId: string;
  productName: string;
  productSku: string;
  basePrice: number;
  categoryId: string;
  categoryPath: string;
  thumbnailUrl?: string;
  reason: string;
  priceDifference: number;
  isInStock: boolean;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  type?: "welcome_kit" | "event_swag" | "client_gift" | "holiday" | "custom";
  isPublic?: boolean;
}

/**
 * Template Service
 * Handles all template-related API calls
 */
class TemplateService {
  /**
   * Create template from existing order
   */
  async createFromOrder(
    orderId: string,
    data: CreateTemplateData
  ): Promise<ProductTemplate> {
    const res = await api.post(`/admin/templates/from-order/${orderId}`, data);
    return res.data?.data?.template;
  }

  /**
   * Get templates list
   */
  async getTemplates(filters?: {
    type?: string;
    isPublic?: boolean;
    isActive?: boolean;
  }): Promise<ProductTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.isPublic !== undefined)
      params.append("isPublic", String(filters.isPublic));
    if (filters?.isActive !== undefined)
      params.append("isActive", String(filters.isActive));

    const res = await api.get(`/admin/templates?${params}`);
    return res.data?.data?.templates || [];
  }

  /**
   * Get template detail
   */
  async getTemplate(templateId: string): Promise<ProductTemplate> {
    const res = await api.get(`/admin/templates/${templateId}`);
    return res.data?.data?.template;
  }

  /**
   * Load template for reorder
   */
  async loadForReorder(templateId: string): Promise<LoadTemplateResult> {
    const res = await api.get(
      `/admin/templates/${templateId}/load-for-reorder`
    );
    return res.data?.data;
  }

  /**
   * Get suggested substitutes for a product
   */
  async getSuggestedSubstitutes(
    templateId: string,
    productId: string
  ): Promise<SubstituteProduct[]> {
    const res = await api.get(
      `/admin/templates/${templateId}/substitutes/${productId}`
    );
    return res.data?.data?.substitutes || [];
  }

  /**
   * Update template substitutes
   */
  async updateSubstitutes(
    templateId: string,
    productId: string,
    substituteProductIds: string[]
  ): Promise<ProductTemplate> {
    const res = await api.put(
      `/admin/templates/${templateId}/substitutes/${productId}`,
      { substituteProductIds }
    );
    return res.data?.data?.template;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    data: Partial<CreateTemplateData>
  ): Promise<ProductTemplate> {
    const res = await api.put(`/admin/templates/${templateId}`, data);
    return res.data?.data?.template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await api.delete(`/admin/templates/${templateId}`);
  }
}

export const templateService = new TemplateService();
