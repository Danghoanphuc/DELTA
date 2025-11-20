// src/services/printerOrder.service.ts
// API Service cho Printer Order Management (Proofing Workflow)

import api from "@/shared/lib/axios";

export interface ProofUploadData {
  proofUrl: string;
  fileName: string;
  fileType: string;
}

export interface OrderResponse {
  success: boolean;
  data: {
    order: any; // Will use proper Order type from @printz/types
    message?: string;
  };
}

/**
 * Lấy chi tiết đơn hàng (cho printer)
 */
export const getOrderDetail = async (orderId: string): Promise<any> => {
  const res = await api.get<OrderResponse>(`/printers/orders/${orderId}`);
  return res.data.data.order;
};

/**
 * Upload proof file cho đơn hàng
 */
export const uploadProof = async (
  orderId: string,
  data: ProofUploadData
): Promise<any> => {
  const res = await api.put<OrderResponse>(
    `/printers/orders/${orderId}/proof`,
    data
  );
  return res.data.data.order;
};

/**
 * Upload file lên Cloudinary (reuse from printer service)
 */
export const uploadProofFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<{ success: boolean; data: { url: string } }>(
    "/media-assets/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data.data.url;
};

export const printerOrderService = {
  getOrderDetail,
  uploadProof,
  uploadProofFile,
};

