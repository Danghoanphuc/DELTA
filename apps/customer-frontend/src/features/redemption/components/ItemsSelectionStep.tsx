// src/features/redemption/components/ItemsSelectionStep.tsx
// ✅ SOLID: Single Responsibility - Items selection only

import { Package, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { RedemptionItem, Selection } from "../hooks/useRedemption";

interface ItemsSelectionStepProps {
  items: RedemptionItem[];
  selections: Selection[];
  primaryColor: string;
  onSelectionChange: (
    itemIndex: number,
    field: "selectedSize" | "selectedColor",
    value: string
  ) => void;
  onNext: () => void;
}

export function ItemsSelectionStep({
  items,
  selections,
  primaryColor,
  onSelectionChange,
  onNext,
}: ItemsSelectionStepProps) {
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Chọn tùy chọn cho quà của bạn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Số lượng: {item.quantity}
                  </p>
                </div>
              </div>

              {/* Size Selection */}
              {item.allowSizeSelection && item.availableSizes.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Chọn size</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          onSelectionChange(idx, "selectedSize", size)
                        }
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selections[idx]?.selectedSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {item.allowColorSelection && item.availableColors.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Chọn màu</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          onSelectionChange(idx, "selectedColor", color.name)
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          selections[idx]?.selectedColor === color.name
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={onNext}
        className="w-full"
        size="lg"
        style={{ backgroundColor: primaryColor }}
      >
        Tiếp tục
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </>
  );
}
