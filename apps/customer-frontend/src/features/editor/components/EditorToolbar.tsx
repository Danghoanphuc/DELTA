// src/features/editor/components/EditorToolbar.tsx
// ✅ PHIÊN BẢN SỬA LỖI: Gỡ bỏ hoàn toàn Tab "Thuộc tính"
// và các props liên quan.

import React, { useState, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
// ❌ Gỡ bỏ Slider, ToggleGroup, Magnet, v.v.
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Upload,
  Type,
  Square,
  // ❌ Gỡ bỏ Settings, Move, Scale, RotateCcw
  Loader2,
  Library,
  LayoutTemplate,
  Sparkles,
  Circle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
// ❌ Gỡ bỏ DecalInfo, GizmoMode
import { UploadedImageVM } from "@/services/mediaAssetService";

// (Component DraggableImageItem giữ nguyên)
const DraggableImageItem: React.FC<{ image: UploadedImageVM }> = ({
  image,
}) => {
  const onDragStart = (e: React.DragEvent) => {
    if (image.isLoading) {
      e.preventDefault();
      return;
    }
    const dragData = { type: "image", imageUrl: image.url };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };
  return (
    <div
      className={cn(
        "relative aspect-square border rounded-md overflow-hidden cursor-move hover:ring-2 hover:ring-blue-500 transition-all",
        image.isLoading && "cursor-wait opacity-50"
      )}
      draggable={!image.isLoading}
      onDragStart={onDragStart}
    >
      {image.url ? (
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      ) : null}
      {image.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

// ✅ SỬA: Gỡ bỏ các props không còn dùng
interface EditorToolbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  uploadedImages: UploadedImageVM[];
  onImageUpload: (file: File) => void;
  onImageFileRead: (file: File, imageUrl: string) => void;
  imageDropQueue: File | null;
  // ❌ Gỡ bỏ: decals, selectedDecalId, onDecalUpdate
  // ❌ Gỡ bỏ: gizmoMode, onGizmoModeChange, isSnapping
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTab,
  onTabChange,
  uploadedImages,
  onImageUpload,
  onImageFileRead,
  imageDropQueue,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // (Các hàm handler file upload giữ nguyên)
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh (PNG, JPG, WEBP)");
      return;
    }
    if (imageDropQueue && imageDropQueue.name === file.name) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageFileRead(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onImageUpload(file);
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ❌ Gỡ bỏ 'selectedDecal'

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      orientation="vertical"
      className="flex w-full"
    >
      {/* Tabs List */}
      <TabsList className="flex flex-col h-auto min-h-[300px] gap-1 p-2 border-r bg-gray-50/50">
        <TabsTrigger
          value="templates"
          className="flex flex-col w-full py-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <LayoutTemplate size={18} />
          <span className="text-[10px] mt-1 font-medium">Mẫu</span>
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          className="flex flex-col w-full py-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Sparkles size={18} />
          <span className="text-[10px] mt-1 font-medium">AI</span>
        </TabsTrigger>
        <TabsTrigger
          value="library"
          className="flex flex-col w-full py-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Library size={18} />
          <span className="text-[10px] mt-1 font-medium">Thư viện</span>
        </TabsTrigger>
        <TabsTrigger
          value="text"
          className="flex flex-col w-full py-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Type size={18} />
          <span className="text-[10px] mt-1 font-medium">Văn bản</span>
        </TabsTrigger>
        <TabsTrigger
          value="shapes"
          className="flex flex-col w-full py-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Square size={18} />
          <span className="text-[10px] mt-1 font-medium">Hình khối</span>
        </TabsTrigger>
        {/* ❌ Gỡ bỏ Trigger 'properties' */}
      </TabsList>

      {/* Tabs Content Area */}
      <div className="flex-1 min-h-[300px] max-h-[50vh] overflow-y-auto custom-scrollbar">
        {/* (Tab Mẫu, AI, Thư viện, Văn bản, Hình khối... giữ nguyên) */}

        {/* Tab Mẫu */}
        <TabsContent value="templates" className="m-0 p-4">
          <h3 className="font-semibold text-sm mb-2">Mẫu Thiết kế</h3>
          <p className="text-xs text-gray-500">
            (Tính năng đang phát triển...)
          </p>
        </TabsContent>

        {/* Tab AI */}
        <TabsContent value="ai" className="m-0 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Tạo bằng AI</h3>
          <Textarea
            placeholder="Mô tả hình ảnh bạn muốn..."
            rows={3}
            className="resize-none text-sm"
          />
          <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 border-0">
            <Sparkles size={16} className="mr-2" /> Tạo ngay
          </Button>
        </TabsContent>

        {/* Tab Thư viện */}
        <TabsContent value="library" className="m-0 p-4 flex flex-col gap-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300",
              isDragging && "border-blue-500 bg-blue-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-600 font-medium text-center">
                Kéo thả hoặc nhấn để tải ảnh
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                (JPG, PNG, tối đa 5MB)
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

          <div className="grid grid-cols-3 gap-2">
            {uploadedImages.map((img) => (
              <DraggableImageItem key={img.id} image={img} />
            ))}
          </div>
        </TabsContent>

        {/* Tab Văn bản */}
        <TabsContent value="text" className="m-0 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Thêm văn bản</h3>
          <Button
            variant="outline"
            className="w-full justify-start cursor-move hover:border-blue-300 hover:bg-blue-50"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "text", text: "Nhập văn bản..." })
              );
            }}
          >
            <Type size={18} className="mr-2 text-gray-500" />
            Tiêu đề lớn
          </Button>
        </TabsContent>

        {/* Tab Hình khối */}
        <TabsContent value="shapes" className="m-0 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Hình cơ bản</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="justify-start cursor-move hover:border-blue-300 hover:bg-blue-50"
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
              <Square size={18} className="mr-2 text-blue-500" /> Vuông
            </Button>
            <Button
              variant="outline"
              className="justify-start cursor-move hover:border-blue-300 hover:bg-blue-50"
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
              <Circle size={18} className="mr-2 text-red-500" /> Tròn
            </Button>
          </div>
        </TabsContent>

        {/* ❌ Gỡ bỏ 'TabsContent' cho "properties" */}
      </div>
    </Tabs>
  );
};
