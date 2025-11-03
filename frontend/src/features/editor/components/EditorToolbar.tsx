// frontend/src/features/editor/components/EditorToolbar.tsx
// ✅ TASK 2: ĐÃ XÓA ZOOM CONTROLS - Zoom đã được tích hợp native vào canvas

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Slider } from "@/shared/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Text,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Minus,
  Download,
  Undo,
  Redo,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  // ✅ TASK 2: Đã XÓA ZoomIn, ZoomOut vì không còn dùng
  Upload,
  Sparkles,
} from "lucide-react";
import { FabricCanvasEditorRef } from "./FabricCanvasEditor";

interface EditorToolbarProps {
  editorRef: React.RefObject<FabricCanvasEditorRef>;
  onImageUpload: (file: File) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorRef,
  onImageUpload,
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [textSettings, setTextSettings] = useState({
    fontSize: 24,
    fontFamily: "Arial",
    color: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
  });

  // ==================== BASIC TOOLS ====================
  const handleAddText = () => {
    editorRef.current?.addText("Nhấn để chỉnh sửa");
  };

  const handleAddShape = (shape: "rect" | "circle" | "triangle" | "line") => {
    editorRef.current?.addShape(shape);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // ==================== HISTORY ====================
  const handleUndo = () => {
    editorRef.current?.undo();
  };

  const handleRedo = () => {
    editorRef.current?.redo();
  };

  // ✅ TASK 2: ĐÃ XÓA - handleZoomIn, handleZoomOut, handleZoomChange
  // Zoom giờ được xử lý native bởi useFabricZoom (mouse wheel tại vị trí con trỏ)

  // ==================== TEXT FORMATTING ====================
  const handleTextStyleChange = (property: string, value: any) => {
    setTextSettings((prev) => ({ ...prev, [property]: value }));
    editorRef.current?.updateTextStyle(property, value);
  };

  // ==================== ALIGNMENT ====================
  const handleAlign = (alignment: any) => {
    editorRef.current?.align(alignment);
  };

  // ==================== FILTERS ====================
  const handleApplyFilter = (filter: any) => {
    editorRef.current?.applyFilter(filter);
  };

  // ==================== EXPORT ====================
  const handleExport = async (format: "png" | "jpg" | "svg") => {
    await editorRef.current?.exportCanvas(format);
  };

  // ==================== OBJECT ACTIONS ====================
  const handleDelete = () => {
    editorRef.current?.deleteSelected();
  };

  const handleDuplicate = () => {
    editorRef.current?.duplicateSelected();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Công cụ chỉnh sửa</h2>
        <p className="text-xs text-gray-500 mt-1">
          Sử dụng các công cụ bên dưới để thiết kế
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Cơ bản</TabsTrigger>
          <TabsTrigger value="text">Chữ</TabsTrigger>
          <TabsTrigger value="effects">Hiệu ứng</TabsTrigger>
        </TabsList>

        {/* ==================== BASIC TAB ==================== */}
        <TabsContent value="basic" className="p-4 space-y-4">
          {/* History Controls */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lịch sử</Label>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleUndo}
                      className="flex-1"
                    >
                      <Undo size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hoàn tác (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRedo}
                      className="flex-1"
                    >
                      <Redo size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Làm lại (Ctrl+Shift+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Separator />

          {/* Add Text */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Thêm nội dung</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAddText}
            >
              <Text size={18} className="mr-2" />
              Thêm chữ
            </Button>

            <Label
              htmlFor="image-upload"
              className="flex items-center justify-start gap-2 w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <ImageIcon size={18} />
              Tải ảnh lên
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Separator />

          {/* Shapes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hình dạng</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddShape("rect")}
                className="justify-start"
              >
                <Square size={18} className="mr-2" />
                Hình vuông
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddShape("circle")}
                className="justify-start"
              >
                <Circle size={18} className="mr-2" />
                Hình tròn
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
                Đường thẳng
              </Button>
            </div>
          </div>

          <Separator />

          {/* Alignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Căn chỉnh</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("left")}
              >
                <AlignLeft size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("center")}
              >
                <AlignCenter size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("right")}
              >
                <AlignRight size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("top")}
              >
                <AlignHorizontalJustifyStart size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("middle")}
              >
                <AlignVerticalJustifyCenter size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAlign("bottom")}
              >
                <AlignHorizontalJustifyEnd size={18} />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Object Actions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Thao tác</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDuplicate}
              >
                <Copy size={18} className="mr-2" />
                Nhân bản
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 size={18} className="mr-2" />
                Xóa
              </Button>
            </div>
          </div>

          {/* ✅ TASK 2: ĐÃ XÓA - Zoom Controls Section */}
          {/* Zoom giờ hoạt động native: lăn chuột để zoom tại vị trí con trỏ */}
        </TabsContent>

        {/* ==================== TEXT TAB ==================== */}
        <TabsContent value="text" className="p-4 space-y-4">
          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font chữ</Label>
            <Select
              value={textSettings.fontFamily}
              onValueChange={(value) =>
                handleTextStyleChange("fontFamily", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Cỡ chữ ({textSettings.fontSize}px)
            </Label>
            <Slider
              value={[textSettings.fontSize]}
              onValueChange={(value) =>
                handleTextStyleChange("fontSize", value[0])
              }
              min={8}
              max={120}
              step={1}
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Màu chữ</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={textSettings.color}
                onChange={(e) => handleTextStyleChange("fill", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={textSettings.color}
                onChange={(e) => handleTextStyleChange("fill", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <Separator />

          {/* Text Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kiểu chữ</Label>
            <div className="flex gap-2">
              <Button
                variant={
                  textSettings.fontWeight === "bold" ? "default" : "outline"
                }
                onClick={() =>
                  handleTextStyleChange(
                    "fontWeight",
                    textSettings.fontWeight === "bold" ? "normal" : "bold"
                  )
                }
                className="flex-1 font-bold"
              >
                B
              </Button>
              <Button
                variant={
                  textSettings.fontStyle === "italic" ? "default" : "outline"
                }
                onClick={() =>
                  handleTextStyleChange(
                    "fontStyle",
                    textSettings.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className="flex-1 italic"
              >
                I
              </Button>
              <Button
                variant={textSettings.underline ? "default" : "outline"}
                onClick={() =>
                  handleTextStyleChange("underline", !textSettings.underline)
                }
                className="flex-1 underline"
              >
                U
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ==================== EFFECTS TAB ==================== */}
        <TabsContent value="effects" className="p-4 space-y-4">
          {/* Image Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <Sparkles size={16} className="inline mr-1" />
              Bộ lọc ảnh
            </Label>
            <p className="text-xs text-gray-500">
              Chọn một ảnh trước để áp dụng hiệu ứng
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleApplyFilter("grayscale")}
              >
                Trắng đen
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApplyFilter("sepia")}
              >
                Hoài cổ
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApplyFilter("blur")}
              >
                Làm mờ
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApplyFilter("brightness")}
              >
                Sáng hơn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApplyFilter("contrast")}
              >
                Tương phản
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <Download size={16} className="inline mr-1" />
              Xuất file
            </Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport("png")}
              >
                Xuất PNG (Nền trong suốt)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport("jpg")}
              >
                Xuất JPG (Nền trắng)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport("svg")}
              >
                Xuất SVG (Vector)
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Keyboard Shortcuts Help */}
      <div className="p-4 border-t bg-gray-50">
        <details className="text-xs">
          <summary className="cursor-pointer font-medium mb-2">
            ⌨️ Phím tắt
          </summary>
          <ul className="space-y-1 text-gray-600">
            <li>
              <kbd className="px-1 bg-white border rounded">Ctrl+Z</kbd> Hoàn
              tác
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Ctrl+Shift+Z</kbd>{" "}
              Làm lại
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Ctrl+C</kbd> Sao
              chép
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Ctrl+V</kbd> Dán
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Ctrl+D</kbd> Nhân
              bản
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Delete</kbd> Xóa
            </li>
            {/* ✅ TASK 2: Thêm hướng dẫn mới */}
            <li>
              <kbd className="px-1 bg-white border rounded">Space</kbd> + Kéo
              chuột: Di chuyển canvas
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Scroll</kbd> Zoom
              tại vị trí con trỏ
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Arrow keys</kbd> Di
              chuyển
            </li>
            <li>
              <kbd className="px-1 bg-white border rounded">Shift+Arrow</kbd> Di
              chuyển nhanh
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
};
