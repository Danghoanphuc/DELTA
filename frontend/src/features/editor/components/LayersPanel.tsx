// frontend/src/features/editor/components/LayersPanel.tsx
// ✅ LAYERS PANEL - Layer management

import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Search,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
}

interface LayersPanelProps {
  editorRef: React.RefObject<any>;
  className?: string;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  editorRef,
  className,
}) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update layers when canvas changes
  useEffect(() => {
    const updateLayers = () => {
      const canvas = editorRef.current?.getCanvas?.();
      if (!canvas) return;

      const objects = canvas.getObjects() || [];
      const activeObject = canvas.getActiveObject();

      const newLayers: Layer[] = objects.map((obj: any, index: number) => {
        // Generate readable name based on object type
        let name = obj.name || getObjectTypeName(obj.type, index);

        return {
          id: obj.id || `layer-${index}`,
          name,
          type: obj.type || "object",
          visible: obj.visible !== false,
          locked: obj.lockMovementX || false,
          selected: activeObject === obj,
        };
      });

      setLayers(newLayers.reverse()); // Reverse to show top layer first
    };

    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    // Listen to canvas events
    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);
    canvas.on("selection:created", updateLayers);
    canvas.on("selection:updated", updateLayers);
    canvas.on("selection:cleared", updateLayers);

    updateLayers();

    return () => {
      canvas.off("object:added", updateLayers);
      canvas.off("object:removed", updateLayers);
      canvas.off("object:modified", updateLayers);
      canvas.off("selection:created", updateLayers);
      canvas.off("selection:updated", updateLayers);
      canvas.off("selection:cleared", updateLayers);
    };
  }, [editorRef]);

  const getObjectTypeName = (type: string, index: number): string => {
    const typeNames: { [key: string]: string } = {
      text: "Text",
      "i-text": "Text",
      textbox: "Text",
      image: "Image",
      rect: "Rectangle",
      circle: "Circle",
      triangle: "Triangle",
      line: "Line",
      path: "Path",
      group: "Group",
    };
    return `${typeNames[type] || "Object"} ${index + 1}`;
  };

  const getLayerIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      text: <Type size={16} />,
      "i-text": <Type size={16} />,
      textbox: <Type size={16} />,
      image: <ImageIcon size={16} />,
      rect: <Square size={16} />,
      circle: <Circle size={16} />,
      triangle: <Triangle size={16} />,
    };
    return icons[type] || <Square size={16} />;
  };

  const toggleVisibility = (index: number) => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - index; // Reverse index
    const obj = objects[actualIndex];

    if (obj) {
      obj.set({ visible: !obj.visible });
      canvas.renderAll();
    }
  };

  const toggleLock = (index: number) => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];

    if (obj) {
      const isLocked = obj.lockMovementX;
      obj.set({
        lockMovementX: !isLocked,
        lockMovementY: !isLocked,
        lockScalingX: !isLocked,
        lockScalingY: !isLocked,
        lockRotation: !isLocked,
        selectable: isLocked,
        evented: isLocked,
      });
      canvas.renderAll();
    }
  };

  const selectLayer = (index: number) => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];

    if (obj && !obj.lockMovementX) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const deleteLayer = (index: number) => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];

    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
  };

  const renameLayer = (index: number, newName: string) => {
    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];

    if (obj) {
      obj.name = newName;
      canvas.renderAll();
    }
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const canvas = editorRef.current?.getCanvas?.();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const fromIndex = objects.length - 1 - draggedIndex;
    const toIndex = objects.length - 1 - index;

    // Move object in canvas
    const obj = objects[fromIndex];
    canvas.remove(obj);
    canvas.insertAt(obj, toIndex);
    canvas.renderAll();

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Filter layers by search term
  const filteredLayers = layers.filter((layer) =>
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold mb-3">Layers</h3>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            type="text"
            placeholder="Search layers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredLayers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {searchTerm ? "No layers found" : "No layers yet"}
            </div>
          ) : (
            filteredLayers.map((layer, index) => (
              <div
                key={layer.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group flex items-center gap-2 px-2 py-2 rounded-lg mb-1 cursor-pointer transition-colors",
                  layer.selected
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-transparent",
                  draggedIndex === index && "opacity-50"
                )}
                onClick={() => selectLayer(index)}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} className="text-gray-400" />
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0",
                    layer.selected ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {getLayerIcon(layer.type)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => renameLayer(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "w-full bg-transparent border-none outline-none text-sm truncate",
                      layer.selected ? "font-medium" : ""
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(index);
                    }}
                  >
                    {layer.visible ? (
                      <Eye size={14} className="text-gray-600" />
                    ) : (
                      <EyeOff size={14} className="text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                  >
                    {layer.locked ? (
                      <Lock size={14} className="text-orange-500" />
                    ) : (
                      <Unlock size={14} className="text-gray-600" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(index);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 flex justify-between">
          <span>{layers.length} layers</span>
          <span>{layers.filter((l) => l.visible).length} visible</span>
        </div>
      </div>
    </div>
  );
};
