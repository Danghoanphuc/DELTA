// features/products/services/product-customization.service.ts
/**
 * Service for Product Customization API calls (Phase 3.3)
 */

import api from "@/shared/lib/axios";
import {
  CustomizationOptions,
  PriceBreakdown,
} from "../types/customization.types";

interface CalculatePriceRequest {
  variantId: string;
  quantity: number;
  customization?: {
    printMethod?: string;
    printAreas?: Array<{
      area: string;
      artworkId?: string;
    }>;
    personalization?: {
      text: string;
      font?: string;
      color?: string;
    };
  };
}

interface CalculatePriceResponse {
  data: {
    priceBreakdown: PriceBreakdown;
  };
}

class ProductCustomizationService {
  /**
   * Calculate price for customized product
   */
  async calculatePrice(
    productId: string,
    request: CalculatePriceRequest
  ): Promise<PriceBreakdown> {
    const res = await api.post<CalculatePriceResponse>(
      `/catalog/products/${productId}/calculate-price`,
      request
    );
    return res.data?.data?.priceBreakdown;
  }

  /**
   * Get product variants
   */
  async getProductVariants(productId: string) {
    const res = await api.get(`/catalog/products/${productId}/variants`);
    return res.data?.data?.variants || [];
  }

  /**
   * Get print methods for product
   */
  async getPrintMethods(productId: string) {
    const res = await api.get(
      `/admin/catalog/products/${productId}/print-methods`
    );
    return res.data?.data?.printMethods || [];
  }
}

export const productCustomizationService = new ProductCustomizationService();
