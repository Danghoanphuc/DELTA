// src/features/shop/components/details/QuantitySelector.tsx
import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  minQuantity: number;
  selectedQuantity: number;
  onQuantityChange: (qty: number) => void;
}

export const QuantitySelector = ({
  minQuantity,
  selectedQuantity,
  onQuantityChange,
}: QuantitySelectorProps) => {
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange(parseInt(e.target.value) || 1);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const finalQty = Math.max(
      minQuantity,
      parseInt(e.target.value) || minQuantity
    );
    onQuantityChange(finalQty);
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(minQuantity, selectedQuantity + delta);
    onQuantityChange(newQuantity);
  };

  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    <div>
      <Label htmlFor="quantity" className="mb-2 block font-medium text-base">
        Số lượng
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-10 h-10"
          onClick={() => adjustQuantity(-1)}
          disabled={selectedQuantity <= minQuantity}
        >
          <Minus size={16} />
        </Button>
        <Input
          id="quantity"
          type="number"
          min={minQuantity}
          value={selectedQuantity}
          onChange={handleManualChange}
          onBlur={handleBlur}
          className="w-20 h-10 text-center text-base font-bold"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-10 h-10"
          onClick={() => adjustQuantity(1)}
        >
          <Plus size={16} />
        </Button>
      </div>
      {isQuantityInvalid && (
        <p className="text-xs text-red-500 mt-1">
          Số lượng tối thiểu: {minQuantity}
        </p>
      )}
    </div>
  );
};
