// src/features/printer/components/product-wizard/steps/Step5_Publish.tsx
// ✅ SỬA: Đổi tên từ Step4 -> Step5

import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { CheckCircle } from "lucide-react";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
}

// ✅ SỬA: Đổi tên component
export function Step5_Publish({ control, isExpanded, onExpand }: StepProps) {
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
          <CheckCircle
            className={isDisabled ? "text-gray-400" : "text-orange-500"}
          />
          {/* ✅ SỬA: Đổi tên Bước */}
          Bước 5: Đăng bán
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <FormField
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Đăng bán sản phẩm này</Label>
                  <p className="text-sm text-gray-500">
                    Cho phép sản phẩm này hiển thị trên cửa hàng của bạn.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      )}
    </Card>
  );
}
