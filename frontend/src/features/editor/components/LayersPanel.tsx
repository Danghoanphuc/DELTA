// src/features/editor/components/LayersPanel.tsx
// ✅ ĐÃ SỬA LỖI LOGIC: Xóa bỏ việc gán ID trong render

import React from "react";
import * as fabric from "fabric";
import { cn } from "@/shared/lib/utils";
// ... (các import icons giữ nguyên) ...
import {
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Type,
  Image,
  Square,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

// ... (Interface và các hàm helper getLayerName, getLayerIcon giữ nguyên) ...
interface LayersPanelProps {
  layers: fabric.Object[];
  activeObjectId: string | null;
  onSelectLayer: (obj: fabric.Object) => void;
  onMoveLayer: (
    obj: fabric.Object,
    direction: "up" | "down" | "top" | "bottom"
  ) => void;
  onToggleVisibility: (obj: fabric.Object) => void;
  onDeleteLayer: (obj: fabric.Object) => void;
  className?: string;
}
const getLayerName = (obj: fabric.Object): string => {
  if (obj.type === "i-text") {
    return (obj as fabric.IText).text?.substring(0, 20) || "Text";
  }
  if (obj.type === "image") {
    return "Image";
  }
  return obj.type || "Object";
};
const getLayerIcon = (obj: fabric.Object) => {
  switch (obj.type) {
    case "i-text":
      return <Type size={16} className="mr-2 flex-shrink-0" />;
    case "image":
      return <Image size={16} className="mr-2 flex-shrink-0" />;
    default:
      return <Square size={16} className="mr-2 flex-shrink-0" />;
  }
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeObjectId,
  onSelectLayer,
  onMoveLayer,
  onToggleVisibility,
  onDeleteLayer,
  className,
}) => {
  const reversedLayers = [...layers].reverse();

  return (
    <div
      className={cn(
        "bg-white border-l border-gray-200 flex flex-col",
        className
      )}
    >
      <h4 className="p-4 text-lg font-semibold border-b">Layers</h4>
      <ScrollArea className="flex-1">
        {reversedLayers.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Canvas is empty</p>
        ) : (
          <div className="space-y-1 p-2">
            {reversedLayers.map((obj) => {
              // ❌ LOGIC GÁN ID ĐÃ BỊ XÓA KHỎI ĐÂY

              // ✅ Lấy ID đã được gán từ hook
              const objId = (obj as any).id;
              if (!objId) return null; // Bỏ qua nếu chưa có ID
              const isActive = objId === activeObjectId;

              return (
                <div
                  key={objId}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100",
                    isActive && "bg-blue-100 hover:bg-blue-100",
                    !obj.visible && "opacity-50"
                  )}
                  onClick={() => onSelectLayer(obj)}
                >
                  {/* Icon & Tên */}
                  <div className="flex items-center overflow-hidden mr-2">
                    {getLayerIcon(obj)}
                    <span
                      className="text-sm truncate"
                      title={getLayerName(obj)}
                    >
                      {getLayerName(obj)}
                    </span>
                  </div>

                  {/* Các nút actions (Giữ nguyên) */}
                  <div
                    className={cn(
                      "flex items-center gap-1 flex-shrink-0",
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    {/* ... (Tất cả các button giữ nguyên) ... */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveLayer(obj, "top");
                      }}
                    >
                      <ChevronsUp size={14} />
                    </Button>
                    {/* ... */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(obj);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
