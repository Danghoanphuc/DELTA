// frontend/src/features/editor/components/PropertiesPanel.tsx
// ✅ FIX: Optimize để tránh re-render không cần thiết

import React, { memo } from "react";
import { EditorCanvasRef } from "./EditorCanvas";
import { ImagePropertiesPanel } from "./ImagePropertiesPanel";
import { TextPropertiesPanel } from "./TextPropertiesPanel";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Settings } from "lucide-react";

interface PropertiesPanelProps {
  selectedObject: any | null; // fabric.Object
  editorRef: React.RefObject<EditorCanvasRef | null>;
  onUpdate: () => void;
}

// ✅ FIX 1: Tách EmptyState thành component riêng để tránh re-render
const EmptyState = memo(() => (
  <Card className="border-black border-[1.5px]">
    <CardContent className="p-4 text-center">
      <p className="text-sm text-gray-500">Chọn một đối tượng để chỉnh sửa</p>
    </CardContent>
  </Card>
));
EmptyState.displayName = "EmptyState";

// ✅ FIX 2: Tách DefaultPanel thành component riêng
interface DefaultPanelProps {
  objectType: string;
  isLocked: boolean;
}

const DefaultPanel = memo(({ objectType, isLocked }: DefaultPanelProps) => (
  <Card className="border-black border-[1.5px]">
    <CardContent className="p-4 space-y-2 text-xs">
      <div className="flex justify-between">
        <span className="text-gray-600">Loại đối tượng:</span>
        <span className="font-medium">{objectType}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Khóa:</span>
        <span className="font-medium">{isLocked ? "Có" : "Không"}</span>
      </div>
    </CardContent>
  </Card>
));
DefaultPanel.displayName = "DefaultPanel";

// ✅ FIX 3: Sử dụng memo cho PropertiesPanel
export const PropertiesPanel: React.FC<PropertiesPanelProps> = memo(
  ({ selectedObject, editorRef, onUpdate }) => {
    // Early return nếu không có object
    if (!selectedObject) {
      return <EmptyState />;
    }

    // ✅ FIX 4: Extract các props cần thiết để tránh pass toàn bộ object
    const objectType = selectedObject.type;
    const isLocked = Boolean(selectedObject.lockMovementX);

    // Render panel theo loại đối tượng
    switch (objectType) {
      case "i-text":
      case "text":
      case "textbox":
        return (
          <TextPropertiesPanel
            selectedObject={selectedObject}
            editorRef={editorRef}
            onUpdate={onUpdate}
          />
        );

      case "image":
        return (
          <ImagePropertiesPanel
            selectedObject={selectedObject}
            editorRef={editorRef}
            onUpdate={onUpdate}
          />
        );

      default:
        return <DefaultPanel objectType={objectType} isLocked={isLocked} />;
    }
  },
  (prevProps, nextProps) => {
    // ✅ FIX 5: Custom comparison để tránh re-render không cần thiết
    // Chỉ re-render khi selectedObject hoặc key props thay đổi
    if (prevProps.selectedObject !== nextProps.selectedObject) {
      return false; // Props changed, need to re-render
    }
    if (prevProps.editorRef !== nextProps.editorRef) {
      return false;
    }
    if (prevProps.onUpdate !== nextProps.onUpdate) {
      return false;
    }
    return true; // Props are the same, skip re-render
  }
);

PropertiesPanel.displayName = "PropertiesPanel";
