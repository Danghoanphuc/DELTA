// apps/admin-frontend/src/services/admin.kitting.service.ts
// ✅ Kitting Service - Phase 6.2
// API calls cho kitting operations

import api from "../lib/axios";

// ============================================
// INTERFACES
// ============================================

export interface KittingChecklistItem {
  skuVariantId: string;
  sku: string;
  productName: string;
  productImage?: string;
  quantityNeeded: number;
  quantityPacked: number;
  isPacked: boolean;
  scannedAt?: Date;
  scannedBy?: string;
}

export interface KittingChecklist {
  orderId: string;
  orderNumber: string;
  totalRecipients: number;
  items: KittingChecklistItem[];
  progress: {
    totalItems: number;
    packedItems: number;
    percentComplete: number;
  };
  status: "pending" | "in_progress" | "completed";
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  completedBy?: string;
}

export interface SwagOrderKitting {
  _id: string;
  orderNumber: string;
  organization: {
    businessName: string;
  };
  totalRecipients: number;
  production: {
    status: string;
    qcStatus: string;
    kittingStatus: string;
    kittingStartedAt?: Date;
    kittingCompletedAt?: Date;
  };
  scheduledSendDate?: Date;
  createdAt: Date;
}

export interface ScanResult {
  success: boolean;
  sku: string;
  productName: string;
  expectedQuantity: number;
  scannedQuantity: number;
  scannedAt: Date;
  scannedBy: string;
}

export interface InventoryValidation {
  orderId: string;
  allAvailable: boolean;
  items: {
    sku: string;
    productName: string;
    quantityNeeded: number;
    availableStock: number;
    isAvailable: boolean;
    shortage: number;
  }[];
}

// ============================================
// KITTING SERVICE
// ============================================

class KittingService {
  /**
   * Get kitting queue
   * Requirements: 8.1
   */
  async getKittingQueue(
    filters: {
      status?: string;
      priority?: string;
      sortBy?: string;
    } = {}
  ): Promise<SwagOrderKitting[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const res = await api.get(`/admin/kitting/queue?${params}`);
    return res.data?.data?.orders || [];
  }

  /**
   * Get kitting checklist
   * Requirements: 8.1, 8.2
   */
  async getKittingChecklist(orderId: string): Promise<KittingChecklist> {
    const res = await api.get(`/admin/kitting/${orderId}/checklist`);
    return res.data?.data?.checklist;
  }

  /**
   * Get kitting progress
   * Requirements: 8.2
   */
  async getKittingProgress(orderId: string) {
    const res = await api.get(`/admin/kitting/${orderId}/progress`);
    return res.data?.data?.progress;
  }

  /**
   * Validate inventory for kitting
   * Requirements: 8.2
   */
  async validateInventory(orderId: string): Promise<InventoryValidation> {
    const res = await api.get(`/admin/kitting/${orderId}/validate-inventory`);
    return res.data?.data?.validation;
  }

  /**
   * Start kitting process
   * Requirements: 8.2
   */
  async startKitting(orderId: string) {
    const res = await api.post(`/admin/kitting/${orderId}/start`);
    return res.data?.data?.order;
  }

  /**
   * Scan item during kitting
   * Requirements: 8.2, 8.3
   */
  async scanItem(
    orderId: string,
    sku: string,
    quantity?: number
  ): Promise<ScanResult> {
    const res = await api.post(`/admin/kitting/${orderId}/scan`, {
      sku,
      quantity,
    });
    return res.data?.data?.scanResult;
  }

  /**
   * Complete kitting process
   * Requirements: 8.3, 8.4
   */
  async completeKitting(orderId: string) {
    const res = await api.post(`/admin/kitting/${orderId}/complete`);
    return res.data?.data?.order;
  }
}

export const kittingService = new KittingService();
