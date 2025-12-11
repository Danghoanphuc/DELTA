// src/services/admin.inventory.service.ts
// ✅ SOLID: Single Responsibility - API calls only

import api from "@/lib/axios";

// ==================== Types ====================

export interface InventoryLevels {
  onHand: number;
  reserved: number;
  available: number;
  inTransit: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestockDate?: Date;
  nextRestockDate?: Date;
}

export interface SkuVariant {
  _id: string;
  sku: string;
  productId: string;
  productName: string;
  attributes: {
    size?: string;
    color?: string;
    material?: string;
  };
  price: number;
  cost: number;
  inventory: InventoryLevels;
  isActive: boolean;
}

export interface InventoryTransaction {
  _id: string;
  skuVariantId: string;
  sku: string;
  productName: string;
  type:
    | "purchase"
    | "sale"
    | "adjustment"
    | "return"
    | "damage"
    | "reserve"
    | "release"
    | "transfer";
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  referenceType:
    | "swag_order"
    | "production_order"
    | "manual_adjustment"
    | "purchase_order";
  referenceId?: string;
  referenceNumber?: string;
  unitCost: number;
  totalCost: number;
  reason: string;
  notes?: string;
  performedBy: string;
  createdAt: Date;
}

export interface InventoryOverview {
  totalVariants: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface LowStockItem {
  variant: SkuVariant;
  needsReorder: boolean;
  daysUntilStockout?: number;
}

export interface FulfillmentCheck {
  canFulfill: boolean;
  insufficientItems: {
    sku: string;
    requested: number;
    available: number;
    shortfall: number;
  }[];
}

// ==================== Service ====================

class AdminInventoryService {
  private baseUrl = "/api/admin/inventory";

  // ==================== Overview & Stats ====================

  async getInventoryOverview(): Promise<InventoryOverview> {
    const res = await api.get(`${this.baseUrl}`);
    return res.data?.data?.overview || {};
  }

  async getLowStockItems(threshold?: number): Promise<LowStockItem[]> {
    const params = new URLSearchParams();
    if (threshold) params.append("threshold", threshold.toString());
    const res = await api.get(`${this.baseUrl}/low-stock?${params}`);
    return res.data?.data?.items || [];
  }

  // ==================== Variant Operations ====================

  async getVariantInventory(variantId: string): Promise<SkuVariant> {
    const res = await api.get(`${this.baseUrl}/${variantId}`);
    return res.data?.data?.variant;
  }

  async getBulkInventoryLevels(
    skus: string[]
  ): Promise<Record<string, InventoryLevels>> {
    const res = await api.post(`${this.baseUrl}/bulk-levels`, { skus });
    return res.data?.data?.levels || {};
  }

  // ==================== Transactions ====================

  async getTransactionHistory(
    variantId: string,
    options?: {
      page?: number;
      limit?: number;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    transactions: InventoryTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.type) params.append("type", options.type);
    if (options?.startDate)
      params.append("startDate", options.startDate.toISOString());
    if (options?.endDate)
      params.append("endDate", options.endDate.toISOString());

    const res = await api.get(
      `${this.baseUrl}/${variantId}/transactions?${params}`
    );
    return res.data?.data || { transactions: [], pagination: {} };
  }

  // ==================== Inventory Operations ====================

  async reserveInventory(
    variantId: string,
    data: {
      quantity: number;
      orderId: string;
      orderNumber: string;
      reason?: string;
    }
  ): Promise<SkuVariant> {
    const res = await api.post(`${this.baseUrl}/${variantId}/reserve`, data);
    return res.data?.data?.variant;
  }

  async releaseInventory(
    variantId: string,
    data: {
      quantity: number;
      orderId: string;
      orderNumber: string;
      reason?: string;
    }
  ): Promise<SkuVariant> {
    const res = await api.post(`${this.baseUrl}/${variantId}/release`, data);
    return res.data?.data?.variant;
  }

  async adjustInventory(
    variantId: string,
    data: {
      quantityChange: number;
      reason: string;
      notes?: string;
    }
  ): Promise<SkuVariant> {
    const res = await api.post(`${this.baseUrl}/${variantId}/adjust`, data);
    return res.data?.data?.variant;
  }

  async recordPurchase(
    variantId: string,
    data: {
      quantity: number;
      unitCost: number;
      purchaseOrderId?: string;
      purchaseOrderNumber?: string;
      notes?: string;
    }
  ): Promise<SkuVariant> {
    const res = await api.post(`${this.baseUrl}/${variantId}/purchase`, data);
    return res.data?.data?.variant;
  }

  async recordSale(
    variantId: string,
    data: {
      quantity: number;
      orderId: string;
      orderNumber: string;
      notes?: string;
    }
  ): Promise<SkuVariant> {
    const res = await api.post(`${this.baseUrl}/${variantId}/sale`, data);
    return res.data?.data?.variant;
  }

  // ==================== Fulfillment Check ====================

  async checkFulfillment(
    items: { sku: string; quantity: number }[]
  ): Promise<FulfillmentCheck> {
    const res = await api.post(`${this.baseUrl}/check-fulfillment`, { items });
    return res.data?.data || { canFulfill: false, insufficientItems: [] };
  }
}

export const adminInventoryService = new AdminInventoryService();
