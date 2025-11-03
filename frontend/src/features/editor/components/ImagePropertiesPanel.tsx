// frontend/src/features/editor/components/ImagePropertiesPanel.tsx
// ✅ TASK 4: CONTEXTUAL PANEL - Chỉnh sửa Image

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

interface ImagePropertiesPanelProps {
  selectedObject: any; // fabric.Image
  onUpdate: () => void;
}

export const ImagePropertiesPanel: React.FC<ImagePropertiesPanelProps> = ({
  selectedObject,
  onUpdate,
}) => {
  const applyFilter = (
    filterType: "grayscale" | "sepia" | "blur" | "brightness" | "contrast"
  ) => {
    if (!selectedObject) return;

    // Import fabric filters
    const fabric = require("fabric").fabric;

    selectedObject.filters = selectedObject.filters || [];

    // Remove existing filter of same type
    selectedObject.filters = selectedObject.filters.filter((f: any) => {
      if (filterType === "grayscale")
        return !(f instanceof fabric.filters.Grayscale);
      if (filterType === "sepia") return !(f instanceof fabric.filters.Sepia);
      if (filterType === "blur") return !(f instanceof fabric.filters.Blur);
      if (filterType === "brightness")
        return !(f instanceof fabric.filters.Brightness);
      if (filterType === "contrast")
        return !(f instanceof fabric.filters.Contrast);
      return true;
    });

    // Add new filter
    let filter;
    switch (filterType) {
      case "grayscale":
        filter = new fabric.filters.Grayscale();
        break;
      case "sepia":
        filter = new fabric.filters.Sepia();
        break;
      case "blur":
        filter = new fabric.filters.Blur({ blur: 0.3 });
        break;
      case "brightness":
        filter = new fabric.filters.Brightness({ brightness: 0.1 });
        break;
      case "contrast":
        filter = new fabric.filters.Contrast({ contrast: 0.1 });
        break;
      default:
        return;
    }

    selectedObject.filters.push(filter);
    selectedObject.applyFilters();
    selectedObject.canvas?.renderAll();
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon size={16} />
          Thuộc tính Hình ảnh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Info */}
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

        {/* Filters */}
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

        {/* Image Actions */}
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

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 Kéo góc ảnh để thay đổi kích thước. Giữ Shift để giữ tỷ lệ.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
