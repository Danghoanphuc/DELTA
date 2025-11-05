// frontend/src/features/editor/components/DebugPanel.tsx
// 🔥 DEBUG PANEL - Visualize texture realtime & thông tin debug

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Eye, EyeOff, Bug } from "lucide-react";

interface DebugPanelProps {
  canvasElements: Map<string, HTMLCanvasElement>;
  materialKey?: string;
  isVisible?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  canvasElements,
  materialKey,
  isVisible = false,
}) => {
  const [showPanel, setShowPanel] = useState(isVisible);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    materialKey || null
  );

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
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-[600px] overflow-auto shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bug size={16} className="text-yellow-500" />
          Texture Debug Panel
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
          <EyeOff size={16} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info */}
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Materials:</span>
            <Badge variant="secondary">{materialsArray.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active Material:</span>
            <Badge variant="default">{materialKey || "None"}</Badge>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold">Materials & Textures:</h4>
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
                {/* Preview */}
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

        {/* Instructions */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p className="font-semibold mb-1">💡 Debug Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Check if material names match</li>
            <li>Verify texture is updating realtime</li>
            <li>Inspect texture resolution</li>
            <li>Look for console logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
