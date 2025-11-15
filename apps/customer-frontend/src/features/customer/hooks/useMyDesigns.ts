// src/features/customer/hooks/useMyDesigns.ts
import { useState, useEffect } from "react";
import api from "@/shared/lib/axios"; //
import { toast } from "sonner";

// Định nghĩa 1 kiểu dữ liệu đơn giản cho thiết kế
// (Bạn có thể tạo file src/types/design.ts nếu muốn)
export interface MyCustomDesign {
  _id: string;
  userId: string;
  baseTemplateId?: string;
  baseProductId?: string; // ✅ THÊM: ID sản phẩm gốc
  editorData: any; // JSON từ Fabric.js
  status?: "draft" | "saved"; // ✅ THÊM: Trạng thái
  finalPreviewImageUrl?: string; // URL ảnh xem trước (deprecated)
  preview?: {
    thumbnailUrl?: string; // ✅ THÊM: URL ảnh xem trước mới
  };
  createdAt: string;
  updatedAt?: string;
}

export const useMyDesigns = () => {
  const [designs, setDesigns] = useState<MyCustomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "saved">("all");

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      try {
        const res = await api.get("/designs/customized/my-designs");
        setDesigns(res.data?.data?.designs || []);
      } catch (err) {
        console.error("Lỗi khi tải thiết kế:", err);
        toast.error("Không thể tải danh sách thiết kế của bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // ✅ THÊM: Filter designs theo status
  const filteredDesigns = designs.filter((design) => {
    if (filter === "all") return true;
    return design.status === filter;
  });

  return {
    designs: filteredDesigns,
    allDesigns: designs,
    loading,
    setDesigns,
    filter,
    setFilter,
  };
};
