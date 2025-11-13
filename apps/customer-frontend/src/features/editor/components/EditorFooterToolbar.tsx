// src/features/editor/components/EditorFooterToolbar.tsx
// ✅ SỬA LỖI: Đảm bảo tên hàm 'EditorFooterToolbar'
// khớp với 'export default EditorFooterToolbar'

import {
  Hand,
  Move,
  Undo,
  Redo,
  ZoomOut,
  ZoomIn,
  RotateCcw,
  Eye,
  Lock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";
import { Card } from "@/shared/components/ui/card";
import React from "react"; // ✅ Thêm import React

interface EditorFooterToolbarProps {
  // (Props...
}

// ✅ SỬA: Tên hàm 'EditorFooterToolbar' đã chính xác
function EditorFooterToolbar(props: any) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <Card className="flex items-center gap-2 p-2 rounded-lg shadow-lg border border-gray-100 bg-white/95 backdrop-blur-md">
        {/* 1. Select / Pan Toggle */}
        <ToggleGroup type="single" defaultValue="select" className="gap-0.5">
          <ToggleGroupItem
            value="select"
            aria-label="Công cụ chọn (Gizmo)"
            title="Công cụ chọn (Gizmo)"
            className="w-10 h-10 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
          >
            <Move size={18} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="pan"
            aria-label="Công cụ Di chuyển (Pan)"
            title="Công cụ Di chuyển (Pan)"
            className="w-10 h-10 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
          >
            <Hand size={18} />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* 2. Undo / Redo */}
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Undo (đang phát triển)"
          className="w-10 h-10"
        >
          <Undo size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Redo (đang phát triển)"
          className="w-10 h-10"
        >
          <Redo size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 3. Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          title="Zoom out"
          className="w-10 h-10"
        >
          <ZoomOut size={18} />
        </Button>
        <span className="text-sm font-medium w-16 text-center select-none text-gray-700">
          100%
        </span>
        <Button
          variant="ghost"
          size="icon"
          title="Zoom in"
          className="w-10 h-10"
        >
          <ZoomIn size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 4. Lock (New Feature) & Reset */}
        <Button
          variant="ghost"
          size="icon"
          title="Giữ vật thể đứng im (đang phát triển)"
          className="w-10 h-10"
        >
          <Lock size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Reset Camera"
          className="w-10 h-10"
        >
          <RotateCcw size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 5. Preview */}
        <Button
          variant="ghost"
          size="icon"
          title="Preview (đang phát triển)"
          className="w-10 h-10"
        >
          <Eye size={18} />
        </Button>
      </Card>
    </div>
  );
}

// ✅ SỬA: Export default đúng tên hàm
export default EditorFooterToolbar;
