// src/features/printer/components/product-wizard/steps/Step4_Pricing.tsx
// ✅ SỬA: Đổi tên từ Step3 -> Step4

import { Control, FieldArrayWithId } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { DollarSign, Plus, Trash2 } from "lucide-react";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  fields: FieldArrayWithId<ProductWizardFormValues, "pricing", "id">[];
  append: (val: { minQuantity: number; pricePerUnit: number }) => void;
  remove: (index: number) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

// ✅ SỬA: Đổi tên component
export function Step4_Pricing({
  control,
  fields,
  append,
  remove,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;

  return (
    <Card
      onClick={onExpand}
      className={isDisabled ? "bg-gray-50" : "cursor-pointer"}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDisabled ? "text-gray-400" : ""
          }`}
        >
          <DollarSign
            className={isDisabled ? "text-gray-400" : "text-green-600"}
          />
          {/* ✅ SỬA: Đổi tên Bước */}
          Bước 4: Cài đặt Bảng giá
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FormField
                  control={control}
                  name={`pricing.${index}.minQuantity`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Số lượng (từ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`pricing.${index}.pricePerUnit`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Đơn giá (VND)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="text-red-600"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ minQuantity: 0, pricePerUnit: 0 })}
          >
            <Plus size={16} className="mr-2" /> Thêm bậc giá
          </Button>
          <hr />
          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 5)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
