// frontend/src/features/editor/components/ImagePropertiesPanel.tsx
// ✅ ĐÃ REFACTOR (Vấn đề 3): Loại bỏ logic trùng lặp, dùng editorRef

import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EditorCanvasRef } from "./EditorCanvas"; // ✅ Import Ref type

interface ImagePropertiesPanelProps {
  selectedObject: any; // fabric.Image
  editorRef: React.RefObject<EditorCanvasRef | null>; // ✅ Nhận editorRef
  onUpdate: () => void;
}

export const ImagePropertiesPanel: React.FC<ImagePropertiesPanelProps> = ({
  selectedObject,
  editorRef, // ✅ Sử dụng editorRef
  onUpdate,
}) => {
  const applyFilter = (
    filterType: "grayscale" | "sepia" | "blur" | "brightness" | "contrast"
  ) => {
    // ✅ Gọi hàm API chuẩn hóa
    editorRef.current?.applyFilter(filterType);
    onUpdate();
    toast.success(`Đã áp dụng hiệu ứng ${filterType}`);
  };

  const removeAllFilters = () => {
    if (selectedObject) {
      selectedObject.filters = [];
      selectedObject.applyFilters();
      selectedObject.canvas?.renderAll();
      onUpdate();
      toast.success("Đã xóa tất cả hiệu ứng");
    }
  };

  return (
    <Card className="border-black border-[1.5px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon size={16} />
          Thuộc tính Hình ảnh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Info (Giữ nguyên) */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Chiều rộng:</span>
            <span className="font-medium">
              {Math.round(
                (selectedObject?.width || 0) * (selectedObject?.scaleX || 1)
              )}
              px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chiều cao:</span>
            <span className="font-medium">
              {Math.round(
                (selectedObject?.height || 0) * (selectedObject?.scaleY || 1)
              )}
              px
            </span>
          </div>
        </div>

        <Separator />

        {/* Filters (Giữ nguyên UI, thay đổi logic) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Sparkles size={14} />
            Bộ lọc ảnh
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter("grayscale")}
            >
              Trắng đen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter("sepia")}
            >
              Hoài cổ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter("blur")}
            >
              Làm mờ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter("brightness")}
            >
              Sáng hơn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter("contrast")}
            >
              Tương phản
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeAllFilters}
              className="col-span-2 text-red-600 hover:text-red-700"
            >
              Xóa hiệu ứng
            </Button>
          </div>
        </div>

        <Separator />

        {/* Image Actions (Giữ nguyên) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Thao tác</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedObject) {
                  selectedObject.set({ flipX: !selectedObject.flipX });
                  selectedObject.canvas?.renderAll();
                  onUpdate();
                }
              }}
            >
              Lật ngang
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedObject) {
                  selectedObject.set({ flipY: !selectedObject.flipY });
                  selectedObject.canvas?.renderAll();
                  onUpdate();
                }
              }}
            >
              Lật dọc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
