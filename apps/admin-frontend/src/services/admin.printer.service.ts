// apps/admin-frontend/src/services/admin.printer.service.ts
import api from "@/lib/axios";

// ✅ FIX: Interface đầy đủ hơn
export interface IPrinterProfile {
  _id: string;
  businessName: string;
  contactPhone: string;
  contactEmail?: string;
  shopAddress?: {
    street: string;
    district: string;
    city: string;
  };
  verificationStatus:
    | "not_submitted"
    | "pending_review"
    | "approved"
    | "rejected";
  isVerified: boolean;
  isActive: boolean;
  verificationDocs?: {
    gpkdUrl?: string;
    cccdUrl?: string;
  };
  user?: {
    _id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  } | string;
  updatedAt: string | Date;
  createdAt?: string | Date;
}

export interface IPaginatedPrinters {
  data: IPrinterProfile[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Lấy danh sách nhà in đang chờ duyệt
 * (Không thay đổi)
 */
export const getPendingPrinters = async (
  page: number = 1
): Promise<IPaginatedPrinters> => {
  try {
    const res = await api.get("/admin/printers/vetting", {
      params: { page },
    });
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Lỗi khi tải danh sách chờ duyệt";
    throw new Error(message);
  }
};

/**
 * Duyệt (Approve/Reject) một nhà in
 * (NÂNG CẤP)
 */
export const verifyPrinter = async ({
  printerId,
  action,
  reason, // <-- THÊM TRƯỜNG MỚI
}: {
  printerId: string;
  action: "approve" | "reject";
  reason?: string; // <-- THÊM TRƯỜNG MỚI
}): Promise<IPrinterProfile> => {
  try {
    // --- GỬI 'reason' TRONG BODY ---
    const res = await api.patch(`/admin/printers/${printerId}/verify`, {
      action,
      reason,
    });
    return res.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Lỗi khi duyệt nhà in";
    throw new Error(message);
  }
};
