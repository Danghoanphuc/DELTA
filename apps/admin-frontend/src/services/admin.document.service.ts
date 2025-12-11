// apps/admin-frontend/src/services/admin.document.service.ts
// ✅ Document Service - Phase 7.2
// API calls cho document operations

import api from "@/lib/axios";

// ============================================
// INTERFACES
// ============================================

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  swagOrderId: string;
  swagOrderNumber: string;
  organizationId: string;
  billingInfo: {
    businessName: string;
    taxCode: string;
    address: string;
    email: string;
    phone: string;
  };
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "refunded";
  paymentMethod?: string;
  paidAmount: number;
  paidAt?: Date;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  creditNotes: {
    creditNoteNumber: string;
    amount: number;
    reason: string;
    issuedAt: Date;
    pdfUrl?: string;
  }[];
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryNote {
  deliveryNoteNumber: string;
  productionOrderId: string;
  swagOrderNumber: string;
  supplier: {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  items: {
    sku: string;
    productName: string;
    quantity: number;
    printMethod: string;
    printAreas: any[];
    personalization?: any;
  }[];
  specifications: any;
  expectedCompletionDate: Date;
  generatedAt: Date;
}

export interface PackingSlip {
  packingSlipNumber: string;
  orderNumber: string;
  recipient: {
    name: string;
    email: string;
    phone: string;
    address: any;
  };
  items: {
    productName: string;
    quantity: number;
    image?: string;
  }[];
  generatedAt: Date;
}

export interface OrderDocuments {
  invoice?: Invoice;
  packingSlips: {
    recipient: string;
    url: string;
    generatedAt: Date;
  }[];
  deliveryNotes: {
    supplier: string;
    url: string;
    generatedAt: Date;
  }[];
}

// ============================================
// DOCUMENT SERVICE
// ============================================

class DocumentService {
  /**
   * Generate invoice from swag order
   * Requirements: 10.1, 10.2
   */
  async generateInvoice(orderId: string, dueInDays?: number): Promise<Invoice> {
    const res = await api.post(`/admin/documents/invoice/${orderId}`, {
      dueInDays,
    });
    return res.data?.data?.invoice;
  }

  /**
   * Generate credit note
   * Requirements: 10.3
   */
  async generateCreditNote(
    invoiceId: string,
    amount: number,
    reason: string
  ): Promise<Invoice> {
    const res = await api.post(`/admin/documents/credit-note/${invoiceId}`, {
      amount,
      reason,
    });
    return res.data?.data?.invoice;
  }

  /**
   * Generate delivery note
   * Requirements: 10.4
   */
  async generateDeliveryNote(productionOrderId: string): Promise<DeliveryNote> {
    const res = await api.post(
      `/admin/documents/delivery-note/${productionOrderId}`
    );
    return res.data?.data?.deliveryNote;
  }

  /**
   * Generate packing slip
   * Requirements: 8.4
   */
  async generatePackingSlip(
    orderId: string,
    recipientId: string
  ): Promise<PackingSlip> {
    const res = await api.post(
      `/admin/documents/packing-slip/${orderId}/${recipientId}`
    );
    return res.data?.data?.packingSlip;
  }

  /**
   * Get all documents for an order
   * Requirements: 10.1, 10.2, 10.3, 10.4
   */
  async getOrderDocuments(orderId: string): Promise<OrderDocuments> {
    const res = await api.get(`/admin/documents/${orderId}`);
    return res.data?.data?.documents;
  }

  /**
   * Get invoice by ID
   * Requirements: 10.1
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const res = await api.get(`/admin/documents/invoice/${invoiceId}`);
    return res.data?.data?.invoice;
  }

  /**
   * Get invoices by organization
   * Requirements: 10.1
   */
  async getInvoices(
    filters: {
      organizationId?: string;
      status?: string;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters.organizationId)
      params.append("organizationId", filters.organizationId);
    if (filters.status) params.append("status", filters.status);
    if (filters.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const res = await api.get(`/admin/documents/invoices?${params}`);
    return res.data?.data?.invoices || [];
  }

  /**
   * Mark invoice as paid
   * Requirements: 10.2
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    paymentMethod: string,
    amount?: number
  ): Promise<Invoice> {
    const res = await api.post(
      `/admin/documents/invoice/${invoiceId}/mark-paid`,
      {
        paymentMethod,
        amount,
      }
    );
    return res.data?.data?.invoice;
  }
}

export const documentService = new DocumentService();
