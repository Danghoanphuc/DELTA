// frontend/src/features/editor/components/PropertiesPanel.tsx
// ✅ COMPONENT MỚI (Vấn đề 2): Panel thuộc tính theo ngữ cảnh

import React from "react";
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

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  editorRef,
  onUpdate,
}) => {
  if (!selectedObject) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-500">
            Chọn một đối tượng để chỉnh sửa
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tùy thuộc vào loại đối tượng, hiển thị panel tương ứng
  switch (selectedObject.type) {
    case "i-text":
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
      // Panel mặc định cho các đối tượng khác (hình khối, v.v.)
      return (
        <Card>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Loại đối tượng:</span>
              <span className="font-medium">{selectedObject.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Khóa:</span>
              <span className="font-medium">
                {selectedObject.lockMovementX ? "Có" : "Không"}
              </span>
            </div>
          </CardContent>
        </Card>
      );
  }
};
