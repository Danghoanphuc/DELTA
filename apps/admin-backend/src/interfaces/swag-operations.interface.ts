// src/interfaces/swag-operations.interface.ts
// ✅ Swag Operations Interfaces

export interface DateRange {
  from: Date;
  to: Date;
}

export interface OrderFilters {
  status?: string;
  organizationId?: string;
  page: number;
  limit: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ShipmentUpdate {
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

export interface InventoryFilters {
  organizationId?: string;
  lowStockOnly?: boolean;
}

export interface InventoryUpdateRequest {
  quantity: number;
  operation: "add" | "subtract" | "set";
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedToday: number;
  totalOrganizations: number;
  totalRevenue: number;
  attentionNeeded: number;
  ordersByStatus: Record<string, number>;
}

export interface FulfillmentQueue {
  readyToProcess: any[];
  processing: any[];
  kitting: any[];
}

export interface InventoryOverview {
  items: any[];
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    organizationCount: number;
  };
}

// Order statuses
export const ORDER_STATUS = {
  DRAFT: "draft",
  PENDING_INFO: "pending_info",
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  PROCESSING: "processing",
  KITTING: "kitting",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export const SHIPMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  FAILED: "failed",
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type ShipmentStatusType =
  (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];
