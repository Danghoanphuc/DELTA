// src/features/shop/hooks/usePrinterProfileDetails.ts
import { useState, useEffect } from "react";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

// Cấu trúc gallery (từ model.js)
interface PrinterGallery {
  factoryImages: { url: string; caption?: string }[];
  factoryVideoUrl?: string;
}

export const usePrinterProfileDetails = (profileId: string | undefined) => {
  const [gallery, setGallery] = useState<PrinterGallery | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Chỉ fetch khi có profileId
    if (!profileId) return;

    const fetchPrinterDetails = async () => {
      setIsLoading(true);
      try {
        // ✅ Gọi API mới (công khai)
        const res = await api.get(`/printers/public-gallery/${profileId}`);

        // Dữ liệu trả về chỉ chứa { gallery: { factoryImages, factoryVideoUrl } }
        setGallery(res.data?.data?.gallery || null);
      } catch (err: any) {
        // Không toast lỗi nặng, chỉ log
        console.warn(`Không thể tải gallery cho nhà in ${profileId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrinterDetails();
  }, [profileId]);

  return { gallery, isLoading };
};
