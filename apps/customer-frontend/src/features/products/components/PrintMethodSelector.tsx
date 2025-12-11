// features/products/components/PrintMethodSelector.tsx
/**
 * Component for selecting print method and areas
 * Phase 3.3.1 - Task: Choose print method và areas
 */

import React, { useState } from "react";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { PrintMethodSelection, PrintArea } from "../types/customization.types";
import { formatCurrency } from "@/shared/utils/format";

interface PrintMethodOption {
  method: string;
  label: string;
  areas: Array<{
    name: string;
    label: string;
    maxWidth: number;
    maxHeight: number;
    setupFee: number;
    unitCost: number;
  }>;
  leadTime: {
    min: number;
    max: number;
    unit: string;
  };
}

interface PrintMethodSelectorProps {
  printMethods: PrintMethodOption[];
  selection?: PrintMethodSelection;
  onChange: (selection: PrintMethodSelection | undefined) => void;
  disabled?: boolean;
}

export const PrintMethodSelector: React.FC<PrintMethodSelectorProps> = ({
  printMethods,
  selection,
  onChange,
  disabled = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(
    selection?.method
  );

  const currentMethod = printMethods.find((pm) => pm.method === selectedMethod);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    onChange({
      method,
      areas: [],
    });
  };

  const handleAreaToggle = (areaName: string, checked: boolean) => {
    if (!selection) return;

    const newAreas = checked
      ? [...selection.areas, { area: areaName }]
      : selection.areas.filter((a) => a.area !== areaName);

    onChange({
      ...selection,
      areas: newAreas,
    });
  };

  const isAreaSelected = (areaName: string) => {
    return selection?.areas.some((a) => a.area === areaName) || false;
  };

  if (printMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Phương pháp in</h3>

      {/* Method Selection */}
      <div className="space-y-2">
        <Label htmlFor="print-method" className="font-medium">
          Chọn phương pháp in
        </Label>
        <Select
          value={selectedMethod || ""}
          onValueChange={handleMethodChange}
          disabled={disabled}
        >
          <SelectTrigger id="print-method" className="w-full">
            <SelectValue placeholder="Chọn phương pháp in" />
          </SelectTrigger>
          <SelectContent>
            {printMethods.map((pm) => (
              <SelectItem key={pm.method} value={pm.method}>
                {pm.label} ({pm.leadTime.min}-{pm.leadTime.max}{" "}
                {pm.leadTime.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Print Areas Selection */}
      {currentMethod && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label className="font-medium">Chọn vị trí in</Label>
            {currentMethod.areas.map((area) => (
              <div
                key={area.name}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`area-${area.name}`}
                  checked={isAreaSelected(area.name)}
                  onCheckedChange={(checked) =>
                    handleAreaToggle(area.name, checked as boolean)
                  }
                  disabled={disabled}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`area-${area.name}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {area.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Kích thước tối đa: {area.maxWidth}x{area.maxHeight}mm
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Phí setup: {formatCurrency(area.setupFee)} | Chi phí/sp:{" "}
                    {formatCurrency(area.unitCost)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
