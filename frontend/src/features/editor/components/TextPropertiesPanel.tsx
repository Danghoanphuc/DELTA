// frontend/src/features/editor/components/TextPropertiesPanel.tsx
// ✅ TASK 4: CONTEXTUAL PANEL - Chỉnh sửa Text

import React, { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Type } from "lucide-react";

interface TextPropertiesPanelProps {
  selectedObject: any; // fabric.IText
  onUpdate: () => void;
}

export const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
  selectedObject,
  onUpdate,
}) => {
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [color, setColor] = useState("#000000");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);

  // Sync state với selectedObject
  useEffect(() => {
    if (selectedObject) {
      setFontSize(selectedObject.fontSize || 24);
      setFontFamily(selectedObject.fontFamily || "Arial");
      setColor(selectedObject.fill || "#000000");
      setFontWeight(selectedObject.fontWeight || "normal");
      setFontStyle(selectedObject.fontStyle || "normal");
      setUnderline(selectedObject.underline || false);
    }
  }, [selectedObject]);

  const handleUpdate = (property: string, value: any) => {
    if (selectedObject) {
      selectedObject.set(property, value);
      selectedObject.canvas?.renderAll();
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Type size={16} />
          Thuộc tính Văn bản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Font chữ</Label>
          <Select
            value={fontFamily}
            onValueChange={(value) => {
              setFontFamily(value);
              handleUpdate("fontFamily", value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              <SelectItem value="Impact">Impact</SelectItem>
              <SelectItem value="Tahoma">Tahoma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Cỡ chữ ({fontSize}px)</Label>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => {
              setFontSize(value[0]);
              handleUpdate("fontSize", value[0]);
            }}
            min={8}
            max={120}
            step={1}
          />
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Màu chữ</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                handleUpdate("fill", e.target.value);
              }}
              className="w-16 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                handleUpdate("fill", e.target.value);
              }}
              className="flex-1"
            />
          </div>
        </div>

        <Separator />

        {/* Text Style */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Kiểu chữ</Label>
          <div className="flex gap-2">
            <Button
              variant={fontWeight === "bold" ? "default" : "outline"}
              onClick={() => {
                const newWeight = fontWeight === "bold" ? "normal" : "bold";
                setFontWeight(newWeight);
                handleUpdate("fontWeight", newWeight);
              }}
              className="flex-1 font-bold"
              size="sm"
            >
              B
            </Button>
            <Button
              variant={fontStyle === "italic" ? "default" : "outline"}
              onClick={() => {
                const newStyle = fontStyle === "italic" ? "normal" : "italic";
                setFontStyle(newStyle);
                handleUpdate("fontStyle", newStyle);
              }}
              className="flex-1 italic"
              size="sm"
            >
              I
            </Button>
            <Button
              variant={underline ? "default" : "outline"}
              onClick={() => {
                setUnderline(!underline);
                handleUpdate("underline", !underline);
              }}
              className="flex-1 underline"
              size="sm"
            >
              U
            </Button>
          </div>
        </div>

        <Separator />

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Căn chỉnh</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate("textAlign", "left")}
            >
              Trái
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate("textAlign", "center")}
            >
              Giữa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate("textAlign", "right")}
            >
              Phải
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 Nhấn đúp vào văn bản trên canvas để chỉnh sửa trực tiếp
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
