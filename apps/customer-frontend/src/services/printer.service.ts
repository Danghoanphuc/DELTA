// src/services/printer.service.ts
// API Service cho Printer Profile Management

import api from "@/shared/lib/axios";
import type { IPrinterProfile, UpdatePrinterProfileDTO } from "@printz/types";

export interface PrinterProfileResponse {
  success: boolean;
  data: {
    profile: IPrinterProfile;
  };
}

/**
 * Lấy thông tin profile của nhà in hiện tại
 */
export const getMyProfile = async (): Promise<IPrinterProfile> => {
  const res = await api.get<PrinterProfileResponse>("/printers/profile/me");
  return res.data.data.profile;
};

/**
 * Cập nhật profile của nhà in hiện tại
 */
export const updateMyProfile = async (
  data: UpdatePrinterProfileDTO
): Promise<IPrinterProfile> => {
  const res = await api.put<PrinterProfileResponse>("/printers/profile/me", data);
  return res.data.data.profile;
};

/**
 * Upload ảnh lên Cloudinary
 */
export const uploadImage = async (file: File): Promise<string> => {
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

export const printerService = {
  getMyProfile,
  updateMyProfile,
  uploadImage,
};

