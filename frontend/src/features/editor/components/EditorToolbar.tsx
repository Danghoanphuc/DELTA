// frontend/src/features/editor/components/EditorToolbar.tsx
// ✅ CẬP NHẬT: Đã thêm lại các nút "Hình dạng" (Elements)

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Upload,
  Type,
  Square,
  Layers,
  // ✅ 1. IMPORT LẠI CÁC ICON BỊ THIẾU
  Circle,
  Triangle,
  Minus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EditorCanvasRef } from "./EditorCanvas";
import { LayersPanel } from "./LayersPanel";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { TextPropertiesPanel } from "./TextPropertiesPanel";
import { ImagePropertiesPanel } from "./ImagePropertiesPanel";

// Interface (Giữ nguyên)
interface EditorToolbarProps {
  editorRef: React.RefObject<EditorCanvasRef | null>;
  onImageUpload: (file: File) => void;
  layers: any[];
  activeObjectId: string | null;
  onSelectLayer: (obj: any) => void;
  onMoveLayer: (obj: any, direction: "up" | "down" | "top" | "bottom") => void;
  onToggleVisibility: (obj: any) => void;
  onDeleteLayer: (obj: any) => void;
  selectedObject: any | null;
  onPropertiesUpdate: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorRef,
  onImageUpload,
  layers,
  activeObjectId,
  onSelectLayer,
  onMoveLayer,
  onToggleVisibility,
  onDeleteLayer,
  selectedObject,
  onPropertiesUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // ... (Handlers giữ nguyên) ...
  const handleAddText = () => {
    editorRef.current?.addText("Nhấn để chỉnh sửa");
  };
  const handleAddShape = (shape: "rect" | "circle" | "triangle" | "line") => {
    editorRef.current?.addShape(shape); //
  };
  // ... (các handler file giữ nguyên) ...
  const processFile = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        editorRef.current?.addImage(imageUrl);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ==================== RENDER (ĐÃ SỬA) ====================
  return (
    // Container (w-60, h-full) giữ nguyên
    <Tabs
      defaultValue="upload"
      orientation="vertical"
      className="flex w-80 bg-white rounded-lg shadow-xl overflow-hidden h-full"
    >
      {/* TabsList (Giữ nguyên) */}
      <TabsList className="flex flex-col h-full gap-1 p-2 border-r">
        <TabsTrigger
          value="upload"
          className="flex flex-col w-full py-4 h-auto"
        >
          <Upload size={20} />
          <span className="text-xs mt-1">Uploads</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="flex flex-col w-full py-4 h-auto">
          <Type size={20} />
          <span className="text-xs mt-1">Text</span>
        </TabsTrigger>
        <TabsTrigger
          value="shapes"
          className="flex flex-col w-full py-4 h-auto"
        >
          <Square size={20} />
          <span className="text-xs mt-1">Elements</span>
        </TabsTrigger>
        <TabsTrigger
          value="layers"
          className="flex flex-col w-full py-4 h-auto"
        >
          <Layers size={20} />
          <span className="text-xs mt-1">Layers</span>
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="flex-1 h-full">
        {/* Tab "Upload" (Giữ nguyên) */}
        <TabsContent value="upload" className="m-0 h-full">
          {/* ... (Nội dung tab Uploads giữ nguyên) ... */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Upload ảnh</h3>
            <Label
              htmlFor="image-upload"
              className={cn(
                "flex flex-col items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                isDragging && "bg-blue-50 border-blue-500"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                Click or drop
              </span>
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {selectedObject && selectedObject.type === "image" && (
              <>
                <Separator className="my-4" />
                <ImagePropertiesPanel
                  selectedObject={selectedObject}
                  editorRef={editorRef}
                  onUpdate={onPropertiesUpdate}
                />
              </>
            )}
          </div>
        </TabsContent>

        {/* Tab "Text" (Giữ nguyên) */}
        <TabsContent value="text" className="m-0 h-full">
          {/* ... (Nội dung tab Text giữ nguyên) ... */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Thêm văn bản</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAddText}
            >
              <Type size={18} className="mr-2" />
              Thêm văn bản
            </Button>
            <p className="text-xs text-gray-500">
              Nhấn đúp vào canvas để chỉnh sửa
            </p>
            {selectedObject && selectedObject.type === "i-text" && (
              <>
                <Separator className="my-4" />
                <TextPropertiesPanel
                  selectedObject={selectedObject}
                  editorRef={editorRef}
                  onUpdate={onPropertiesUpdate}
                />
              </>
            )}
          </div>
        </TabsContent>

        {/* ✅ 2. CẬP NHẬT: Tab "Shapes" (Elements) */}
        <TabsContent value="shapes" className="m-0 h-full">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Hình dạng</h3>
            <div className="grid grid-cols-1 gap-2">
              {/* THÊM LẠI CÁC NÚT NÀY */}
              <Button
                variant="outline"
                onClick={() => handleAddShape("rect")}
                className="justify-start"
              >
                <Square size={18} className="mr-2" />
                Vuông
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddShape("circle")}
                className="justify-start"
              >
                <Circle size={18} className="mr-2" />
                Tròn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddShape("triangle")}
                className="justify-start"
              >
                <Triangle size={18} className="mr-2" />
                Tam giác
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddShape("line")}
                className="justify-start"
              >
                <Minus size={18} className="mr-2" />
                Đường
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab "Layers" (Giữ nguyên) */}
        <TabsContent value="layers" className="m-0 h-full">
          <LayersPanel
            className="w-full h-full border-l-0 border-t-0"
            layers={layers}
            activeObjectId={activeObjectId || null}
            onSelectLayer={onSelectLayer}
            onMoveLayer={onMoveLayer}
            onToggleVisibility={onToggleVisibility}
            onDeleteLayer={onDeleteLayer}
          />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};
