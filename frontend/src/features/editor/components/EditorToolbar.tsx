// frontend/src/features/editor/components/EditorToolbar.tsx
// ✅ TASK 3: TÁI CẤU TRÚC - 2-Panel Design (Primary Icons + Secondary Content)

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import {
  Upload,
  Type,
  Square,
  Sparkles,
  Layers,
  Circle,
  Triangle,
  Minus,
} from "lucide-react";
import { FabricCanvasEditorRef } from "./FabricCanvasEditor";

interface EditorToolbarProps {
  editorRef: React.RefObject<FabricCanvasEditorRef>;
  onImageUpload: (file: File) => void;
}

type ToolMode = "upload" | "text" | "shapes" | "inspiration" | "layers" | null;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorRef,
  onImageUpload,
}) => {
  const [activeMode, setActiveMode] = useState<ToolMode>(null);

  // ==================== HANDLERS ====================
  const handleAddText = () => {
    editorRef.current?.addText("Nhấn để chỉnh sửa");
  };

  const handleAddShape = (shape: "rect" | "circle" | "triangle" | "line") => {
    editorRef.current?.addShape(shape);
    setActiveMode(null);
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
      setActiveMode(null);
    }
  };

  // ==================== PRIMARY BAR ITEMS ====================
  const primaryTools = [
    { id: "upload" as ToolMode, icon: Upload, label: "Tải ảnh lên" },
    { id: "text" as ToolMode, icon: Type, label: "Thêm chữ" },
    { id: "shapes" as ToolMode, icon: Square, label: "Hình dạng" },
    { id: "inspiration" as ToolMode, icon: Sparkles, label: "Cảm hứng" },
    { id: "layers" as ToolMode, icon: Layers, label: "Lớp" },
  ];

  // ==================== SECONDARY PANEL CONTENT ====================
  const renderSecondaryContent = () => {
    switch (activeMode) {
      case "upload":
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Tải ảnh lên</h3>
            <Label
              htmlFor="image-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">Chọn ảnh</span>
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Hỗ trợ: JPG, PNG, SVG (tối đa 10MB)
            </p>
          </div>
        );

      case "text":
        return (
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
              Nhấn vào canvas để chỉnh sửa sau khi thêm
            </p>
          </div>
        );

      case "shapes":
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Hình dạng</h3>
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
        );

      case "inspiration":
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Tìm cảm hứng</h3>
            <a
              href="https://www.canva.com/templates/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Canva Templates</p>
                <p className="text-xs text-gray-500">Khám phá mẫu thiết kế</p>
              </div>
            </a>
            <p className="text-xs text-gray-500">
              Tìm cảm hứng từ hàng triệu mẫu chuyên nghiệp
            </p>
          </div>
        );

      case "layers":
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Quản lý Lớp</h3>
            <p className="text-xs text-gray-500">
              Chức năng Layers sẽ được hiển thị ở thanh bên phải khi bạn có đối
              tượng trên canvas.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveMode(null)}
            >
              Đóng
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="flex h-full">
      {/* PRIMARY BAR (Icon-only) */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-2">
        <TooltipProvider>
          {primaryTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeMode === tool.id ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "w-12 h-12 rounded-xl transition-all",
                    activeMode === tool.id &&
                      "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg"
                  )}
                  onClick={() =>
                    setActiveMode(activeMode === tool.id ? null : tool.id)
                  }
                >
                  <tool.icon size={22} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-auto">
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 text-center mb-2">
              ⌨️
            </summary>
            <div className="absolute left-20 bottom-6 bg-white border rounded-lg shadow-lg p-3 w-64 z-50">
              <h4 className="font-semibold text-xs mb-2">Phím tắt</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>
                  <kbd className="px-1 bg-gray-100 border rounded text-xs">
                    Ctrl+Z
                  </kbd>{" "}
                  Hoàn tác
                </li>
                <li>
                  <kbd className="px-1 bg-gray-100 border rounded text-xs">
                    Ctrl+D
                  </kbd>{" "}
                  Nhân bản
                </li>
                <li>
                  <kbd className="px-1 bg-gray-100 border rounded text-xs">
                    Delete
                  </kbd>{" "}
                  Xóa
                </li>
                <li>
                  <kbd className="px-1 bg-gray-100 border rounded text-xs">
                    Space
                  </kbd>{" "}
                  + Kéo: Di chuyển
                </li>
                <li>
                  <kbd className="px-1 bg-gray-100 border rounded text-xs">
                    Scroll
                  </kbd>{" "}
                  Zoom
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      {/* SECONDARY PANEL (Content) */}
      {activeMode && (
        <div className="w-60 bg-white border-r border-gray-200 shadow-lg">
          <div className="h-full overflow-y-auto">
            {renderSecondaryContent()}
          </div>
        </div>
      )}
    </div>
  );
};
