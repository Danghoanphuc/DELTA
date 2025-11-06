// frontend/src/features/editor/components/DebugPanel.tsx
// ✅ BẢN NÂNG CẤP: Hiển thị thông tin Capture Bounds

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Thêm
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Bug, ZoomIn } from "lucide-react"; // Sửa icon

// ✅ THÊM: Định nghĩa kiểu cho bounds
export interface BoundsInfo {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}
export interface DebugInfo {
  artboardBounds?: BoundsInfo;
  dielineBounds?: BoundsInfo;
}

interface DebugPanelProps {
  canvasElements: Map<string, HTMLCanvasElement>;
  materialKey?: string;
  isVisible?: boolean;
  debugInfo: DebugInfo | null; // ✅ THÊM PROP NÀY
}

// ✅ THÊM: Component con để render bounds
const BoundsDisplay: React.FC<{ name: string; bounds?: BoundsInfo }> = ({
  name,
  bounds,
}) => (
  <div className="p-2 border rounded bg-gray-50 space-y-1">
    <span className="text-xs font-semibold">{name}</span>
    {!bounds ? (
      <Badge variant="destructive">NULL</Badge>
    ) : (
      <div className="text-xs font-mono grid grid-cols-2 gap-x-2">
        <span>L: {Math.round(bounds.left || 0)}</span>
        <span>T: {Math.round(bounds.top || 0)}</span>
        <span>W: {Math.round(bounds.width || 0)}</span>
        <span>H: {Math.round(bounds.height || 0)}</span>
      </div>
    )}
  </div>
);

export const DebugPanel: React.FC<DebugPanelProps> = ({
  canvasElements,
  materialKey,
  isVisible = false,
  debugInfo, // ✅ Nhận prop
}) => {
  const [showPanel, setShowPanel] = useState(isVisible);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    materialKey || null
  );

  useEffect(() => {
    setShowPanel(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (materialKey) {
      setSelectedMaterial(materialKey);
    }
  }, [materialKey]);

  if (!showPanel) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 left-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        <Bug size={16} className="mr-2" />
        Debug Panel
      </Button>
    );
  }

  const materialsArray = Array.from(canvasElements.entries());

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] overflow-y-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bug size={16} className="text-yellow-500" />
          Texture Debug Panel
        </CardTitle>
        <CardDescription className="text-xs">
          Panel chẩn đoán lỗi Texture & Capture.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* === SECTION 1: CAPTURE BOUNDS (MỚI) === */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold flex items-center gap-1">
            <ZoomIn size={14} />
            Capture Bounds (Ranh giới Chụp)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <BoundsDisplay
              name="Artboard (Vùng trắng)"
              bounds={debugInfo?.artboardBounds}
            />
            <BoundsDisplay
              name="Dieline (Khuôn)"
              bounds={debugInfo?.dielineBounds}
            />
          </div>
          <p className="text-xs text-gray-500">
            Hàm `textureCapture` sẽ ưu tiên `Dieline`. Nếu `Dieline` là `NULL`,
            nó sẽ chụp `Artboard`.
          </p>
        </div>

        {/* === SECTION 2: MATERIALS INFO === */}
        <div className="text-xs space-y-1">
          <h4 className="text-xs font-semibold">Trạng thái Materials</h4>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Materials:</span>
            <Badge variant="secondary">{materialsArray.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active Material:</span>
            <Badge variant="default">{materialKey || "None"}</Badge>
          </div>
        </div>

        {/* === SECTION 3: TEXTURE PREVIEWS === */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold">Texture Previews (Kết quả):</h4>
          {materialsArray.length === 0 ? (
            <p className="text-xs text-gray-500">No textures yet...</p>
          ) : (
            materialsArray.map(([matName, canvas]) => (
              <div
                key={matName}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  selectedMaterial === matName
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedMaterial(matName)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium truncate flex-1">
                    {matName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {canvas.width}x{canvas.height}
                  </Badge>
                </div>
                <div className="w-full aspect-square bg-gray-100 rounded overflow-hidden border">
                  <img
                    src={canvas.toDataURL()}
                    alt={`${matName} preview`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};