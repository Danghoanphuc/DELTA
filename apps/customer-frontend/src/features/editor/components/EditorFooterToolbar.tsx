// src/features/editor/components/EditorFooterToolbar.tsx
// ✅ HOÀN THIỆN: Kết nối tất cả các tính năng của toolbar-footer

import {
  Hand,
  Move,
  Undo,
  Redo,
  ZoomOut,
  ZoomIn,
  RotateCcw,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";
import { Card } from "@/shared/components/ui/card";
import React, { useState, useCallback, useEffect } from "react";

interface EditorFooterToolbarProps {
  // Undo/Redo (optional - chỉ có trong DesignEditor)
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Camera controls (callbacks from parent)
  onResetCamera?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  
  // Tool mode (select vs pan)
  toolMode?: "select" | "pan";
  onToolModeChange?: (mode: "select" | "pan") => void;
  
  // Zoom level
  zoomLevel?: number;
  
  // Preview (optional)
  onPreview?: () => void;
  
  // Export (optional)
  onExport?: () => void;
}

export default function EditorFooterToolbar({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onResetCamera,
  onZoomIn,
  onZoomOut,
  toolMode = "select",
  onToolModeChange,
  zoomLevel = 100,
  onPreview,
  onExport,
}: EditorFooterToolbarProps) {
  const [currentZoom, setCurrentZoom] = useState(zoomLevel || 100);
  
  // Sync zoom level from props
  useEffect(() => {
    if (zoomLevel !== undefined) {
      setCurrentZoom(zoomLevel);
    }
  }, [zoomLevel]);
  
  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(currentZoom + 10, 200);
    setCurrentZoom(newZoom);
    onZoomIn?.();
  }, [currentZoom, onZoomIn]);
  
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(currentZoom - 10, 25);
    setCurrentZoom(newZoom);
    onZoomOut?.();
  }, [currentZoom, onZoomOut]);
  
  const handleResetCamera = useCallback(() => {
    setCurrentZoom(100);
    onResetCamera?.();
  }, [onResetCamera]);

  // Debug: Log để đảm bảo component render
  useEffect(() => {
    console.log('🔧 EditorFooterToolbar rendered', {
      toolMode,
      zoomLevel,
      hasUndo: !!onUndo,
      hasRedo: !!onRedo,
      hasZoomIn: !!onZoomIn,
      hasZoomOut: !!onZoomOut,
      hasReset: !!onResetCamera,
      hasExport: !!onExport,
      hasToolModeChange: !!onToolModeChange,
      allProps: { onUndo, onRedo, onZoomIn, onZoomOut, onResetCamera, onExport, onToolModeChange }
    });
  }, [toolMode, zoomLevel, onUndo, onRedo, onZoomIn, onZoomOut, onResetCamera, onExport, onToolModeChange]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <Card 
        className="flex items-center gap-2 p-2 rounded-lg shadow-lg border border-gray-100 bg-white/95 backdrop-blur-md" 
        style={{ 
          minWidth: 'fit-content', 
          width: 'auto',
          display: 'flex',
          flexShrink: 0,
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap'
        }}
      >
        {/* 1. Select / Pan Toggle - LUÔN HIỂN THỊ */}
        <ToggleGroup 
          type="single" 
          value={toolMode} 
          onValueChange={(value) => {
            if ((value === "select" || value === "pan") && onToolModeChange) {
              onToolModeChange(value);
            }
          }}
          className="gap-0.5"
          style={{ display: 'flex', flexShrink: 0 }}
        >
          <ToggleGroupItem
            value="select"
            aria-label="Công cụ chọn (Gizmo)"
            title="Công cụ chọn (Gizmo)"
            className="w-10 h-10 flex-shrink-0 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
            style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
          >
            <Move size={18} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="pan"
            aria-label="Công cụ Di chuyển (Pan)"
            title="Công cụ Di chuyển (Pan)"
            className="w-10 h-10 flex-shrink-0 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
            style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
          >
            <Hand size={18} />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-6 flex-shrink-0" style={{ flexShrink: 0, width: '1px', minWidth: '1px' }} />

        {/* 2. Undo / Redo */}
        {onUndo && onRedo && (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canUndo}
              onClick={onUndo}
              title="Hoàn tác (Ctrl+Z)"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <Undo size={18} className={!canUndo ? "opacity-40" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canRedo}
              onClick={onRedo}
              title="Làm lại (Ctrl+Y)"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <Redo size={18} className={!canRedo ? "opacity-40" : ""} />
            </Button>
            <Separator orientation="vertical" className="h-6 flex-shrink-0" style={{ flexShrink: 0 }} />
          </>
        )}

        {/* 3. Zoom Controls */}
        {(onZoomIn || onZoomOut) && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={!onZoomOut}
              title="Zoom out"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <ZoomOut size={18} />
            </Button>
            <span className="text-sm font-medium w-16 text-center select-none text-gray-700 flex-shrink-0" style={{ width: '64px', minWidth: '64px', flexShrink: 0 }}>
              {Math.round(currentZoom)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={!onZoomIn}
              title="Zoom in"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <ZoomIn size={18} />
            </Button>
            <Separator orientation="vertical" className="h-6 flex-shrink-0" style={{ flexShrink: 0 }} />
          </>
        )}

        {/* 4. Reset Camera */}
        {onResetCamera && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetCamera}
            title="Reset Camera về vị trí mặc định"
            className="w-10 h-10 flex-shrink-0"
            style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
          >
            <RotateCcw size={18} />
          </Button>
        )}

        {/* 5. Preview (optional) */}
        {onPreview && (
          <>
            <Separator orientation="vertical" className="h-6 flex-shrink-0" style={{ flexShrink: 0 }} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreview}
              title="Xem trước thiết kế"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <Eye size={18} />
            </Button>
          </>
        )}

        {/* 6. Export (optional) */}
        {onExport && (
          <>
            <Separator orientation="vertical" className="h-6 flex-shrink-0" style={{ flexShrink: 0 }} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              title="Xuất file thiết kế"
              className="w-10 h-10 flex-shrink-0"
              style={{ width: '40px', height: '40px', flexShrink: 0, minWidth: '40px' }}
            >
              <Download size={18} />
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
