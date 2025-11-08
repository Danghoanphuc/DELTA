// frontend/src/features/printer/printer-studio/PrinterStudioToolbar.tsx
// ✅ KHẮC PHỤC: Bổ sung tất cả import còn thiếu (Button, Input, Slider, v.v.)

import React, { useState, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"; // ✅ Sửa casing
import { Label } from "@/shared/components/ui/label"; // ✅ Sửa casing
import { Input } from "@/shared/components/ui/input"; // ✅ Sửa casing
import { Button } from "@/shared/components/ui/button"; // ✅ BỔ SUNG
import { Slider } from "@/shared/components/ui/slider"; // ✅ BỔ SUNG
import { Switch } from "@/shared/components/ui/switch"; // ✅ BỔ SUNG
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"; // ✅ BỔ SUNG
import {
  Upload,
  Type,
  Square,
  Settings,
  Move,
  Scale,
  RotateCcw,
  Magnet,
  Loader2,
  Library,
  Circle, // ✅ BỔ SUNG
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea"; // ✅ Sửa casing

import { UploadedImageVM } from "@/services/mediaAssetService";
import { GizmoMode } from "@/features/editor/hooks/useDesignEditor";
import { EditorItem, DecalItem } from "@/features/editor/types/decal.types";

// Props
interface PrinterStudioToolbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  uploadedImages: UploadedImageVM[];
  onImageUpload: (file: File) => void; // Đổi tên: onFileUpload -> onImageUpload
  decals: EditorItem[];
  selectedDecalId: string | null;
  onDecalUpdate: (id: string, updates: Partial<EditorItem>) => void;
  gizmoMode: GizmoMode;
  onGizmoModeChange: (mode: GizmoMode) => void;
  isSnapping: boolean;

  // Giả sử có thêm các props này từ hook (dựa trên code lần trước)
  onImageFileRead: (file: File, imageUrl: string) => void;
  imageDropQueue: File | null;
}

/**
 * Component con hiển thị ảnh (Đã dùng type VM)
 */
const DraggableImageItem: React.FC<{ image: UploadedImageVM }> = ({
  image,
}) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (image.url) {
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            type: "image",
            imageUrl: image.url,
            name: image.name,
          })
        );
        e.dataTransfer.effectAllowed = "copy";
      } else {
        e.preventDefault();
      }
    },
    [image.url, image.name]
  );

  return (
    <div
      className={cn(
        "relative aspect-square border rounded-md overflow-hidden transition-all",
        image.url ? "cursor-move hover:shadow-md" : "cursor-wait"
      )}
      draggable={!!image.url}
      onDragStart={handleDragStart}
    >
      {image.url ? (
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100"></div>
      )}
      {image.isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
        {image.name}
      </div>
    </div>
  );
};

export const PrinterStudioToolbar: React.FC<PrinterStudioToolbarProps> = ({
  activeTab,
  onTabChange,
  uploadedImages,
  onImageUpload, // Sử dụng prop onImageUpload
  decals,
  selectedDecalId,
  onDecalUpdate,
  gizmoMode,
  onGizmoModeChange,
  isSnapping,
  // (Không cần các prop giả định vì đã có onImageUpload)
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const selectedDecal = decals.find((d) => d.id === selectedDecalId);

  // Handlers cho Drag-and-Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file); // Gọi hàm upload
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file); // Gọi hàm upload
    }
    e.target.value = ""; // Reset input
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      orientation="vertical"
      className="flex w-80 bg-white h-full overflow-hidden"
    >
      {/* 1. Tabs List (Giữ nguyên) */}
      <TabsList className="flex flex-col h-full gap-1 p-2 border-r">
        <TabsTrigger
          value="upload"
          className="flex flex-col w-full py-4 h-auto"
        >
          <Upload size={20} /> <span className="text-xs mt-1">Tải lên</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="flex flex-col w-full py-4 h-auto">
          <Type size={20} /> <span className="text-xs mt-1">Văn bản</span>
        </TabsTrigger>
        <TabsTrigger
          value="shapes"
          className="flex flex-col w-full py-4 h-auto"
        >
          <Square size={20} /> <span className="text-xs mt-1">Thành phần</span>
        </TabsTrigger>
        <TabsTrigger value="properties" className="hidden">
          Properties
        </TabsTrigger>
      </TabsList>

      {/* 2. Tabs Content (Scroll Area) */}
      <NativeScrollArea className="flex-1 h-full">
        {/* Tab Upload & Media Library */}
        <TabsContent value="upload" className="m-0 h-full">
          <div className="p-4 space-y-4 flex flex-col h-full">
            {/* 1. Khu vực Upload Mới */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Tải ảnh mới</h3>
              <Label
                htmlFor="image-upload"
                className={cn(
                  "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={28} className="text-gray-500" />
                <span className="text-sm text-gray-700 font-medium mt-1">
                  Kéo thả hoặc nhấn để tải
                </span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* 2. Khu vực Thư viện của bạn (Media Library) */}
            <div className="border-t pt-4 flex-1 overflow-auto">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Library size={16} className="text-orange-600" />
                Thư viện của bạn
              </h4>
              {uploadedImages.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  Chưa có ảnh nào.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img) => (
                    <DraggableImageItem key={img.id} image={img} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Văn bản (Text) */}
        <TabsContent value="text" className="m-0 h-full">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Thêm văn bản</h3>
            <Button
              variant="outline"
              className="w-full justify-start cursor-move"
              draggable
              onDragStart={(e) => {
                const dragData = { type: "text", text: "Nhấn để chỉnh sửa" };
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify(dragData)
                );
              }}
            >
              <Type size={18} className="mr-2" />
              Thêm văn bản (Kéo)
            </Button>
          </div>
        </TabsContent>

        {/* Tab Hình dạng (Shapes) */}
        <TabsContent value="shapes" className="m-0 h-full">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Hình dạng</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="justify-start cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "shape",
                      shapeType: "rect",
                      color: "#3498db",
                    })
                  );
                }}
              >
                <Square size={18} className="mr-2" /> Vuông
              </Button>
              <Button
                variant="outline"
                className="justify-start cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "shape",
                      shapeType: "circle",
                      color: "#e74c3c",
                    })
                  );
                }}
              >
                <Circle size={18} className="mr-2" /> Tròn
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab Thuộc tính (Properties) */}
        <TabsContent value="properties" className="m-0 h-full">
          <div className="p-4 space-y-6">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Settings size={16} />
              Thuộc tính Decal
            </h3>
            {!selectedDecal || selectedDecal.type !== 'decal' ? (
              <p className="text-xs text-gray-500 text-center py-8">
                Chọn một decal trên model 3D.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Công cụ Gizmo */}
                <div>
                  <Label className="text-xs font-semibold">Công cụ</Label>
                  <ToggleGroup
                    type="single"
                    value={gizmoMode}
                    onValueChange={(value: GizmoMode) =>
                      value && onGizmoModeChange(value)
                    }
                    className="grid grid-cols-2 gap-2 mt-2"
                  >
                    <ToggleGroupItem value="translate" aria-label="Move">
                      <Move className="h-4 w-4 mr-2" /> Di chuyển
                    </ToggleGroupItem>
                    <ToggleGroupItem value="scale" aria-label="Scale">
                      <Scale className="h-4 w-4 mr-2" /> Co giãn
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Gizmo 3D (trên model)</span>
                    {isSnapping ? (
                      <span className="flex items-center text-blue-600 font-semibold">
                        <Magnet size={12} className="mr-1" /> ĐANG HÍT
                      </span>
                    ) : (
                      <span>Giữ [SHIFT] để hít</span>
                    )}
                  </div>
                </div>

                {/* Thanh trượt Xoay (Z-axis) */}
                <div>
                  <Label htmlFor="rotation" className="text-xs font-semibold">
                    Xoay (Spin)
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <RotateCcw className="h-4 w-4 text-gray-500" />
                    <Slider
                      id="rotation"
                      min={-180}
                      max={180}
                      step={1}
                      value={[(selectedDecal.rotation[2] * 180) / Math.PI]}
                      onValueChange={([value]) =>
                        onDecalUpdate(selectedDecal.id, {
                          rotation: [
                            selectedDecal.rotation[0],
                            selectedDecal.rotation[1],
                            (value * Math.PI) / 180,
                          ],
                        })
                      }
                    />
                  </div>
                </div>

                {/* Thanh trượt Kích thước */}
                <div>
                  <Label htmlFor="size" className="text-xs font-semibold">
                    Kích thước (Đồng nhất)
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Scale className="h-4 w-4 text-gray-500" />
                    <Slider
                      id="size"
                      min={0.05}
                      max={2.0}
                      step={0.01}
                      value={[selectedDecal.size[0]]}
                      onValueChange={([value]) =>
                        onDecalUpdate(selectedDecal.id, {
                          size: [value, value],
                        })
                      }
                    />
                  </div>
                </div>

                {/* (Các thuộc tính khác như Text, Color... sẽ ở đây) */}
              </div>
            )}
          </div>
        </TabsContent>
      </NativeScrollArea>
    </Tabs>
  );
};
