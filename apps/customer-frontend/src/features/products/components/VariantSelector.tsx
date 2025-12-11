// features/products/components/VariantSelector.tsx
/**
 * Component for selecting product variants (size, color, material)
 * Phase 3.3.1 - Task: Select variant (size, color)
 */

import React from "react";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { VariantSelection } from "../types/customization.types";

interface VariantAttribute {
  name: string;
  values: string[];
  label: string;
}

interface VariantSelectorProps {
  attributes: VariantAttribute[];
  selection: VariantSelection;
  onChange: (selection: VariantSelection) => void;
  disabled?: boolean;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  attributes,
  selection,
  onChange,
  disabled = false,
}) => {
  const handleAttributeChange = (attributeName: string, value: string) => {
    onChange({
      ...selection,
      [attributeName]: value,
    });
  };

  if (attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn biến thể</h3>

      {attributes.map((attribute) => (
        <div key={attribute.name} className="space-y-2">
          <Label htmlFor={`variant-${attribute.name}`} className="font-medium">
            {attribute.label}
          </Label>
          <Select
            value={selection[attribute.name] || ""}
            onValueChange={(value) =>
              handleAttributeChange(attribute.name, value)
            }
            disabled={disabled}
          >
            <SelectTrigger id={`variant-${attribute.name}`} className="w-full">
              <SelectValue
                placeholder={`Chọn ${attribute.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {attribute.values.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};
