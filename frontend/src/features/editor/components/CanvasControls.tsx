// frontend/src/features/editor/components/CanvasControls.tsx
import React from "react";
import {
  Pointer,
  Hand,
  Undo2,
  Redo2,
  Minus,
  Plus,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

interface CanvasControlsProps {
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  isPanning,
  setIsPanning,
  zoom,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const handleRotate = () => {
    toast.info("Chức năng 'Xoay' chưa được kết nối.");
  };

  const handleView = () => {
    toast.info("Chức năng 'Xem' chưa được kết nối.");
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-1 p-2 bg-white rounded-lg shadow-xl border">
        {/* 1. Select Tool */}
        <Button
          variant={!isPanning ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setIsPanning(false)}
        >
          <Pointer size={18} />
        </Button>

        {/* 2. Hand (Pan) Tool */}
        <Button
          variant={isPanning ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setIsPanning(true)}
        >
          <Hand size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 3. Undo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 size={18} />
        </Button>

        {/* 4. Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 5. Zoom Out */}
        <Button variant="ghost" size="icon" onClick={onZoomOut}>
          <Minus size={18} />
        </Button>

        {/* 6. Zoom Display */}
        <div className="text-sm font-medium w-12 text-center">
          {Math.round(zoom * 100)}%
        </div>

        {/* 7. Zoom In */}
        <Button variant="ghost" size="icon" onClick={onZoomIn}>
          <Plus size={18} />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 8. Rotate (Placeholder) */}
        <Button variant="ghost" size="icon" onClick={handleRotate}>
          <RotateCcw size={18} />
        </Button>

        {/* 9. View (Placeholder) */}
        <Button variant="ghost" size="icon" onClick={handleView}>
          <Eye size={18} />
        </Button>
      </div>
    </div>
  );
};
