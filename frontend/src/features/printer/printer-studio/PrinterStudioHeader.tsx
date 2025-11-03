// frontend/src/features/printer/pages/PrinterStudioHeader.tsx
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { Product } from "@/types/product";

interface PrinterStudioHeaderProps {
  baseProduct: Product | null;
  productId?: string;
  textureData: string | null;
  onSaveAndExit: () => void;
  onGoBack: () => void;
  isSaving?: boolean; // (Tùy chọn, hiện tại logic save ở hook)
}

export const PrinterStudioHeader: React.FC<PrinterStudioHeaderProps> = ({
  baseProduct,
  productId,
  textureData,
  onSaveAndExit,
  onGoBack,
}) => {
  return (
    <div className="h-16 bg-white border-b flex items-center px-6 justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" type="button" onClick={onGoBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Studio - Thiết kế</h1>
          <p className="text-xs text-gray-500">
            Phôi: {baseProduct?.name || "..."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {productId === "new" ? "Chế độ tạo mới" : "Chế độ chỉnh sửa"}
        </Badge>
        {textureData && (
          <Badge variant="secondary" className="text-xs">
            🎨 Texture: {(textureData.length / 1024).toFixed(1)}KB
          </Badge>
        )}
        <Button
          type="button"
          onClick={onSaveAndExit}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Save size={18} className="mr-2" />
          Lưu & Tiếp tục
        </Button>
      </div>
    </div>
  );
};
