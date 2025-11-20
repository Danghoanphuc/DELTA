// features/editor/components/ContextualPropertyBar.tsx
// ✅ NÂNG CẤP: Hỗ trợ nút Group/Ungroup
// ✅ BẢN VÁ: Sửa lỗi typo onValueValueChange

import React from "react";
import { Card } from "@/shared/components/ui/card";
import {
  Move,
  Scale,
  RotateCcw,
  Magnet,
  Bold,
  Italic,
  Underline,
  AlignCenter,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Group, // Icon Group
  Ungroup, // Icon Ungroup
  Undo2, // ✅ THÊM: Undo icon
  Redo2, // ✅ THÊM: Redo icon
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
// ✅ THAY ĐỔI: Import kiểu dữ liệu mới
import { EditorItem, DecalItem, GroupItem } from "../types/decal.types";
import { GizmoMode } from "@/stores/useEditorStore";
import { Input } from "@/shared/components/ui/input"; // Import Input

// === PROPS ===
interface ContextualPropertyBarProps {
  selectedItemIds: string[]; // Thay vì decalId
  items: EditorItem[];
  onItemUpdate: (id: string, updates: Partial<EditorItem>) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDelete: () => void;
  gizmoMode: GizmoMode;
  onGizmoModeChange: (mode: GizmoMode) => void;
  isSnapping: boolean;
  // ✅ THÊM: Undo/Redo props
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// (Component con TextProperties, ImageProperties, ShapeProperties giữ nguyên)
// ... (Nhớ đảm bảo chúng gọi 'onItemUpdate' thay vì 'onDecalUpdate')

// === COMPONENT CHÍNH ===
export function ContextualPropertyBar({
  selectedItemIds,
  items,
  onItemUpdate,
  onGroup,
  onUngroup,
  onDelete,
  gizmoMode,
  onGizmoModeChange,
  isSnapping,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ContextualPropertyBarProps) {
  const selectedItems = items.filter((item) =>
    selectedItemIds.includes(item.id)
  );
  const firstItem = selectedItems[0];
  const isSingleSelect = selectedItems.length === 1;
  const isMultiSelect = selectedItems.length > 1;

  // Không hiển thị nếu không chọn gì
  if (selectedItems.length === 0) {
    return null;
  }

  // === Render Toolbar Content ===
  const renderToolbarContent = () => {
    // 1. Đa lựa chọn (Multi-select)
    if (isMultiSelect) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onGroup}>
            <Group size={16} className="mr-2" />
            Nhóm ({selectedItems.length})
          </Button>
        </div>
      );
    }

    // 2. Chọn 1 item
    if (isSingleSelect && firstItem) {
      switch (firstItem.type) {
        // 2a. Chọn 1 Group
        case "group":
          return (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onUngroup}>
                <Ungroup size={16} className="mr-2" />
                Rã nhóm
              </Button>
              {/* (Có thể thêm input đổi tên group ở đây) */}
            </div>
          );

        // 2b. Chọn 1 Decal
        case "decal":
          // (Logic cũ: render TextProperties, ImageProperties...)
          // return <TextProperties decal={firstItem} onUpdate={onItemUpdate} />;
          return <p className="text-xs p-2">Thuộc tính Decal</p>;
      }
    }
    return null;
  };

  // === Render Công cụ chung (Gizmo, Sliders...) ===
  // (Chỉ render nếu chọn 1 Decal)
  const renderCommonTools = () => {
    if (!isSingleSelect || !firstItem || firstItem.type !== "decal") {
      return null;
    }

    const decal = firstItem as DecalItem;

    return (
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="h-6" />
        {/* Gizmo */}
        <ToggleGroup
          type="single"
          value={gizmoMode}
          // ✅✅✅ SỬA LỖI TYPO TẠI ĐÂY ✅✅✅
          onValueChange={(
            value: GizmoMode // ❌ onValueValueChange
          ) => value && onGizmoModeChange(value)}
        >
          <ToggleGroupItem value="translate" aria-label="Move">
            <Move className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="scale" aria-label="Scale">
            <Scale className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        {/* Snapping */}
        <Button variant="ghost" size="icon" title="Snapping">
          <Magnet size={16} />
        </Button>
        {/* Sliders (Rotate/Scale) */}
        {/* ... (Sliders cho decal.rotation, decal.size) ... */}
      </div>
    );
  };

  // === Render Actions Chung (Lock, Hide, Delete) ===
  const renderCommonActions = () => {
    if (!firstItem) return null; // An toàn

    return (
      <div className="flex items-center gap-1">
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          title={firstItem.isLocked ? "Mở khóa" : "Khóa"}
          onClick={() =>
            onItemUpdate(firstItem.id, { isLocked: !firstItem.isLocked })
          }
        >
          {firstItem.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title={firstItem.isVisible ? "Ẩn" : "Hiện"}
          onClick={() =>
            onItemUpdate(firstItem.id, { isVisible: !firstItem.isVisible })
          }
        >
          {firstItem.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Xóa"
          className="text-red-500"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    );
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <Card className="flex items-center gap-4 p-2 rounded-lg shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md">
        {/* ✅ THÊM: Phần 0 - Undo/Redo (luôn hiển thị) */}
        {onUndo && onRedo && (
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              title="Hoàn tác (Ctrl+Z)"
              className="h-8 w-8 p-0"
            >
              <Undo2 size={16} className={cn(!canUndo && "opacity-40")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              title="Làm lại (Ctrl+Y)"
              className="h-8 w-8 p-0"
            >
              <Redo2 size={16} className={cn(!canRedo && "opacity-40")} />
            </Button>
          </div>
        )}

        {/* Phần 1: Công cụ theo ngữ cảnh (Group/Decal) */}
        {renderToolbarContent()}

        {/* Phần 2: Công cụ 3D (Chỉ cho Decal) */}
        {renderCommonTools()}

        {/* Phần 3: Actions (Lock, Hide, Delete) */}
        {renderCommonActions()}
      </Card>
    </div>
  );
}
