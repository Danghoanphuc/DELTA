// apps/admin-frontend/src/hooks/useDocuments.ts
// ✅ Document Management Hook - Phase 7.2
// State management cho documents

import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  documentService,
  Invoice,
  OrderDocuments,
} from "@/services/admin.document.service";

// ============================================
// INVOICE MANAGEMENT HOOK
// ============================================

export function useInvoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    organizationId: "",
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  /**
   * Fetch invoices
   * Requirements: 10.1
   */
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getInvoices(filters);
      setInvoices(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải danh sách invoices",
        variant: "destructive",
      });
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  /**
   * Generate invoice
   * Requirements: 10.1, 10.2
   */
  const generateInvoice = async (orderId: string, dueInDays?: number) => {
    try {
      const invoice = await documentService.generateInvoice(orderId, dueInDays);
      toast({ title: "Thành công", description: "Đã tạo invoice thành công!" });
      return invoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo invoice",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Mark invoice as paid
   * Requirements: 10.2
   */
  const markAsPaid = async (
    invoiceId: string,
    paymentMethod: string,
    amount?: number
  ) => {
    try {
      const invoice = await documentService.markInvoiceAsPaid(
        invoiceId,
        paymentMethod,
        amount
      );
      toast({
        title: "Thành công",
        description: "Đã đánh dấu invoice là đã thanh toán!",
      });
      fetchInvoices(); // Refresh list
      return invoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật invoice",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Generate credit note
   * Requirements: 10.3
   */
  const generateCreditNote = async (
    invoiceId: string,
    amount: number,
    reason: string
  ) => {
    try {
      const invoice = await documentService.generateCreditNote(
        invoiceId,
        amount,
        reason
      );
      toast({
        title: "Thành công",
        description: "Đã tạo credit note thành công!",
      });
      fetchInvoices(); // Refresh list
      return invoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo credit note",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    invoices,
    isLoading,
    filters,
    setFilters,
    fetchInvoices,
    generateInvoice,
    markAsPaid,
    generateCreditNote,
  };
}

// ============================================
// INVOICE DETAIL HOOK
// ============================================

export function useInvoiceDetail(invoiceId: string) {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch invoice detail
   * Requirements: 10.1
   */
  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setIsLoading(true);
    try {
      const data = await documentService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thông tin invoice",
        variant: "destructive",
      });
      console.error("Error fetching invoice:", error);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, toast]);

  /**
   * Mark invoice as paid
   * Requirements: 10.2
   */
  const markAsPaid = async (paymentMethod: string, amount?: number) => {
    try {
      const updatedInvoice = await documentService.markInvoiceAsPaid(
        invoiceId,
        paymentMethod,
        amount
      );
      setInvoice(updatedInvoice);
      toast({
        title: "Thành công",
        description: "Đã đánh dấu invoice là đã thanh toán!",
      });
      return updatedInvoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật invoice",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Generate credit note
   * Requirements: 10.3
   */
  const generateCreditNote = async (amount: number, reason: string) => {
    try {
      const updatedInvoice = await documentService.generateCreditNote(
        invoiceId,
        amount,
        reason
      );
      setInvoice(updatedInvoice);
      toast({
        title: "Thành công",
        description: "Đã tạo credit note thành công!",
      });
      return updatedInvoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo credit note",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    invoice,
    isLoading,
    fetchInvoice,
    markAsPaid,
    generateCreditNote,
  };
}

// ============================================
// ORDER DOCUMENTS HOOK
// ============================================

export function useOrderDocuments(orderId: string) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<OrderDocuments | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch order documents
   * Requirements: 10.1, 10.2, 10.3, 10.4
   */
  const fetchDocuments = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const data = await documentService.getOrderDocuments(orderId);
      setDocuments(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải documents",
        variant: "destructive",
      });
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toast]);

  /**
   * Generate invoice
   * Requirements: 10.1, 10.2
   */
  const generateInvoice = async (dueInDays?: number) => {
    try {
      const invoice = await documentService.generateInvoice(orderId, dueInDays);
      toast({ title: "Thành công", description: "Đã tạo invoice thành công!" });
      fetchDocuments(); // Refresh
      return invoice;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo invoice",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Generate packing slip
   * Requirements: 8.4
   */
  const generatePackingSlip = async (recipientId: string) => {
    try {
      const packingSlip = await documentService.generatePackingSlip(
        orderId,
        recipientId
      );
      toast({
        title: "Thành công",
        description: "Đã tạo packing slip thành công!",
      });
      fetchDocuments(); // Refresh
      return packingSlip;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo packing slip",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    documents,
    isLoading,
    fetchDocuments,
    generateInvoice,
    generatePackingSlip,
  };
}
