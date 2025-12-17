// apps/admin-frontend/src/hooks/useFileUpload.ts
// Custom hook for file upload logic (Single Responsibility)
//
// Có 2 mode:
// 1. uploadImage(): Upload ngay lên Cloudinary (cho avatar, thumbnail, etc.)
// 2. addPendingImage(): Giữ local, upload khi submit (cho bài viết)

import { useState, useCallback } from "react";
import { uploadService } from "@/services/upload.service";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// Interface cho pending images
export interface PendingImage {
  id: string;
  file: File;
  preview: string; // Blob URL for display
  base64?: string; // Base64 for upload
  alt?: string;
}

export function useFileUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Pending images state (cho mode upload khi submit)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  /**
   * Upload ảnh ngay lập tức lên Cloudinary
   * Dùng cho: avatar, thumbnail, OG image, etc.
   */
  const uploadImage = async (file: File, slug?: string): Promise<string> => {
    setIsUploading(true);
    setUploadStatus("Đang xử lý ảnh...");

    try {
      toast({
        title: "⏳ Đang xử lý",
        description: "Resize, watermark, convert WebP...",
      });

      const url = await uploadService.uploadImage(file, slug);

      toast({
        title: "✅ Thành công",
        description: "Ảnh đã được tối ưu và tải lên!",
      });

      return url;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải ảnh lên",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  /**
   * Thêm ảnh vào pending list (không upload ngay)
   * Dùng cho: ảnh trong bài viết - upload khi submit
   * Trả về preview URL để hiển thị
   */
  const addPendingImage = useCallback(
    async (file: File): Promise<{ id: string; preview: string }> => {
      const id = uuidv4();
      const preview = URL.createObjectURL(file);

      // Convert to base64 for later upload
      const base64 = await fileToBase64(file);

      const pendingImage: PendingImage = {
        id,
        file,
        preview,
        base64,
      };

      setPendingImages((prev) => [...prev, pendingImage]);

      return { id, preview };
    },
    []
  );

  /**
   * Xóa ảnh khỏi pending list
   */
  const removePendingImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const img = prev.find((p) => p.id === id);
      if (img?.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  /**
   * Lấy pending images để gửi kèm khi submit
   */
  const getPendingImagesForSubmit = useCallback(() => {
    return pendingImages.map((img) => ({
      id: img.id,
      data: img.base64 || "",
      type: "base64" as const,
      alt: img.alt,
    }));
  }, [pendingImages]);

  /**
   * Clear pending images sau khi submit thành công
   */
  const clearPendingImages = useCallback(() => {
    pendingImages.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setPendingImages([]);
  }, [pendingImages]);

  /**
   * Lấy preview URL từ pending image ID
   */
  const getPendingPreview = useCallback(
    (id: string): string | null => {
      const img = pendingImages.find((p) => p.id === id);
      return img?.preview || null;
    },
    [pendingImages]
  );

  /**
   * Thay thế blob URLs trong content HTML bằng placeholder {{img:id}}
   * Gọi trước khi submit để backend có thể thay thế bằng URL thật
   */
  const prepareContentForSubmit = useCallback(
    (content: string): string => {
      let result = content;
      pendingImages.forEach((img) => {
        // Escape special regex characters trong blob URL
        const escapedPreview = img.preview.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        // Thay thế blob URL bằng placeholder
        result = result.replace(
          new RegExp(escapedPreview, "g"),
          `{{img:${img.id}}}`
        );
      });
      return result;
    },
    [pendingImages]
  );

  const uploadVideo = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const url = await uploadService.uploadVideo(file);
      toast({ title: "Thành công", description: "Đã tải video lên!" });
      return url;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải video lên",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    // State
    isUploading,
    uploadStatus,
    pendingImages,
    hasPendingImages: pendingImages.length > 0,

    // Upload ngay (cho avatar, thumbnail)
    uploadImage,
    uploadVideo,

    // Pending mode (cho bài viết)
    addPendingImage,
    removePendingImage,
    getPendingImagesForSubmit,
    clearPendingImages,
    getPendingPreview,
    prepareContentForSubmit,
  };
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
