// frontend/src/features/printer/pages/PrinterStudioSidebar.tsx
// ✅ CẬP NHẬT: Đã xóa "Mẹo thiết kế" và "Lưu ý"

import React from "react";
import {
  Card,
  // CardHeader,
  // CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
// ❌ Xóa các import không cần nữa
// import { Separator } from "@/shared/components/ui/separator";
// import { TextPropertiesPanel } from "@/features/editor/components/TextPropertiesPanel";
// import { ImagePropertiesPanel } from "@/features/editor/components/ImagePropertiesPanel";
// import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { Product } from "@/types/product";

// Interface (Giữ nguyên)
interface PrinterStudioSidebarProps {
  selectedObject: any;
  onPropertiesUpdate: () => void;
  baseProduct: Product | null;
  phoiAssets: { materialName: string } | null;
  productId?: string;
  modelUrl: string;
  onModelLoaded: () => void;
}

export const PrinterStudioSidebar: React.FC<PrinterStudioSidebarProps> = ({
  selectedObject,
  onPropertiesUpdate,
  baseProduct,
  phoiAssets,
  productId,
  modelUrl,
  onModelLoaded,
}) => {
  return (
    <div className="w-96 bg-white border-l">
      <ScrollArea className="h-full">
        <div>
          {/* ❌ 1. KHỐI THÔNG TIN PHÔI ĐÃ BỊ XÓA (từ bước trước) */}

          {/* ❌ 2. KHỐI 3D PREVIEW ĐÃ BỊ XÓA (từ bước trước) */}

          {/* ❌ 3. KHỐI "MẸO THIẾT KẾ" ĐÃ BỊ XÓA */}

          {/* ❌ 4. KHỐI "LƯU Ý" ĐÃ BỊ XÓA */}

          {/* Nếu sau này bạn muốn thêm lại thứ gì đó, hãy thêm vào đây */}
        </div>
      </ScrollArea>
    </div>
  );
};
