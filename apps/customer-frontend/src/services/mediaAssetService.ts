// src/services/mediaAssetService.ts
// ✅ GIẢI PHÁP TỐT HƠN: Chỉ dùng đường dẫn tương đối

import api from "@/shared/lib/axios";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { toast } from "@/shared/utils/toast";

export interface MediaAsset {
  _id: string;
  url: string;
  name: string;
  userId: string;
  fileType: string;
  size: number;
  createdAt: string;
}

export interface UploadedImageVM {
  id: string;
  url: string;
  name: string;
  isLoading: boolean;
}

/**
 * Tải thư viện media của người dùng
 */
export const getMyMediaAssets = async (): Promise<MediaAsset[]> => {
  try {
    // ✅ SỬA LỖI: Chỉ dùng đường dẫn tương đối.
    // axios sẽ tự động gọi: ${VITE_API_BASE_URL}/media-assets/my-assets
    const res = await api.get("/media-assets/my-assets");
    return res.data?.data?.assets || [];
  } catch (err: any) {
    console.error("Lỗi không thể tải thư viện media:", err);
    toast.error(err.response?.data?.message || "Không thể tải thư viện ảnh");
    return [];
  }
};

/**
 * Tải file lên cloud VÀ đăng ký vào CSDL (có dọn rác)
 */
export const createMediaAsset = async (file: File): Promise<MediaAsset> => {
  let uploadedUrl = ""; // Biến để lưu URL tạm thời

  try {
    // 1. Tải file lên Cloudinary
    // (Hàm này cũng dùng 'api' đã được cấu hình ở Bước 4)
    uploadedUrl = await uploadFileToCloudinary(file);
    if (!uploadedUrl) {
      throw new Error("Không nhận được URL sau khi upload");
    }

    // 2. Đăng ký URL đó vào CSDL
    // ✅ SỬA LỖI: Chỉ dùng đường dẫn tương đối
    const res = await api.post("/media-assets", {
      url: uploadedUrl,
      name: file.name,
      fileType: file.type,
      size: file.size,
    });

    return res.data?.data?.asset;
  } catch (err: any) {
    console.error("Lỗi khi tạo media asset:", err);

    // ========================================================
    // ✅ LOGIC DỌN RÁC (Giữ nguyên)
    // ========================================================
    if (uploadedUrl) {
      toast.info("Lỗi lưu vào CSDL, đang yêu cầu dọn rác Cloudinary...");
      try {
        // ✅ SỬA LỖI: Chỉ dùng đường dẫn tương đối
        await api.post("/uploads/cleanup-orphan", { url: uploadedUrl });
        toast.success("Đã dọn dẹp file rác trên cloud.");
      } catch (cleanupError: any) {
        console.error(
          "LỖI NGHIÊM TRỌNG: Không thể dọn dẹp file rác:",
          cleanupError
        );
        toast.error(`Lỗi không thể dọn dẹp file rác: ${cleanupError.message}`);
      }
    }

    // Ném lỗi gốc để hook (usePrinterStudio) bắt được
    throw new Error(
      err.response?.data?.message || err.message || "Tải file lên thất bại"
    );
  }
};

/**
 * Xóa file khỏi thư viện (gọi từ UI)
 */
export const deleteMediaAsset = async (assetId: string): Promise<void> => {
  try {
    // ✅ SỬA LỖI: Chỉ dùng đường dẫn tương đối
    await api.delete(`/media-assets/${assetId}`);
    toast.success("Đã xóa ảnh khỏi thư viện");
  } catch (err: any) {
    console.error("Lỗi xóa media asset:", err);
    toast.error(err.response?.data?.message || "Không thể xóa ảnh");
    throw err;
  }
};
