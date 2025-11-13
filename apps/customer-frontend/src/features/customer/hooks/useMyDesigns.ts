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
  editorData: any; // JSON từ Fabric.js
  finalPreviewImageUrl?: string; // URL ảnh xem trước
  createdAt: string;
}

export const useMyDesigns = () => {
  const [designs, setDesigns] = useState<MyCustomDesign[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { designs, loading, setDesigns };
};
