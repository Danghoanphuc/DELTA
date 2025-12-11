// features/products/components/PersonalizationInput.tsx
/**
 * Component for adding personalization text
 * Phase 3.3.1 - Task: Add personalization text
 */

import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PersonalizationText } from "../types/customization.types";

interface PersonalizationInputProps {
  personalization?: PersonalizationText;
  onChange: (personalization: PersonalizationText) => void;
  disabled?: boolean;
}

const FONT_OPTIONS = [
  { value: "arial", label: "Arial" },
  { value: "times", label: "Times New Roman" },
  { value: "helvetica", label: "Helvetica" },
  { value: "courier", label: "Courier" },
  { value: "georgia", label: "Georgia" },
];

const COLOR_OPTIONS = [
  { value: "black", label: "Đen", hex: "#000000" },
  { value: "white", label: "Trắng", hex: "#FFFFFF" },
  { value: "red", label: "Đỏ", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", hex: "#00FF00" },
  { value: "yellow", label: "Vàng", hex: "#FFFF00" },
];

export const PersonalizationInput: React.FC<PersonalizationInputProps> = ({
  personalization = { text: "" },
  onChange,
  disabled = false,
}) => {
  const handleChange = (field: keyof PersonalizationText, value: string) => {
    onChange({
      ...personalization,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cá nhân hóa (tùy chọn)</h3>

      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="personalization-text" className="font-medium">
          Nội dung cá nhân hóa
        </Label>
        <Textarea
          id="personalization-text"
          placeholder="VD: Tên công ty, slogan, số điện thoại..."
          value={personalization.text}
          onChange={(e) => handleChange("text", e.target.value)}
          disabled={disabled}
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Nhập nội dung bạn muốn in thêm lên sản phẩm
        </p>
      </div>

      {/* Font Selection */}
      <div className="space-y-2">
        <Label htmlFor="personalization-font" className="font-medium">
          Font chữ
        </Label>
        <Select
          value={personalization.font || "arial"}
          onValueChange={(value) => handleChange("font", value)}
          disabled={disabled}
        >
          <SelectTrigger id="personalization-font">
            <SelectValue placeholder="Chọn font chữ" />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label htmlFor="personalization-color" className="font-medium">
          Màu chữ
        </Label>
        <Select
          value={personalization.color || "black"}
          onValueChange={(value) => handleChange("color", value)}
          disabled={disabled}
        >
          <SelectTrigger id="personalization-color">
            <SelectValue placeholder="Chọn màu chữ" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
